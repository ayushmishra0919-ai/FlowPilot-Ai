import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Bot, Sparkles, Sliders, Webhook, Zap } from 'lucide-react';
import Card from '../components/common/Card';
import RuleEditor from '../components/workflow/RuleEditor';
import VisualFlowchart from '../components/workflow/VisualFlowchart';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const CreateWorkflowPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.2);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [rules, setRules] = useState([
    {
      id: 'rule-init-1',
      conditionField: 'intent',
      conditionOperator: 'equals',
      conditionValue: 'customer_support',
      action: 'gmail_notification',
      actionParams: {
        recipient: 'support@flowpilot.ai',
        subject: '[FlowPilot Support] {summary}'
      }
    },
    {
      id: 'rule-init-2',
      conditionField: 'intent',
      conditionOperator: 'equals',
      conditionValue: 'lead',
      action: 'google_sheets_insert',
      actionParams: {
        sheetName: 'Inbound Leads 2026'
      }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a workflow name.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        configuration: {
          aiEnabled,
          model,
          temperature: parseFloat(temperature),
          systemPrompt: systemPrompt.trim(),
          rules
        }
      };

      const res = await api.post('/workflows', payload);
      toast.success('Workflow created successfully!');
      navigate(`/workflows/${res.data?.data?._id || res.data?.data?.id || ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create workflow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/workflows"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workflows</span>
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Activate Workflow</span>
            </>
          )}
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Automation Workflow
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure inbound webhook ingestion, OpenAI GPT analysis, and dynamic routing actions.
        </p>
      </div>

      {/* Visual Pipeline Flowchart */}
      <VisualFlowchart />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="space-y-4">
          <h3 className="font-semibold text-white text-base">1. Workflow Profile</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Workflow Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VIP Customer Escalation & Sync"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow accomplishes and what systems it touches..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: AI Processing Engine */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <span>2. AI Analysis & Structuring Model</span>
            </h3>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 w-4 h-4"
              />
              <span>Enable AI Structuring</span>
            </label>
          </div>

          {aiEnabled && (
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Recommended - Ultra-fast)</option>
                    <option value="gpt-4o">gpt-4o (High Reasoning)</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Creativity / Temperature</span>
                    <span className="font-mono text-indigo-400">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer mt-3"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Deterministic (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Custom System Prompt (Optional override)
                </label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Leave empty to use FlowPilot's enterprise default entity extraction prompt..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Section 3: Conditional Routing Rules */}
        <Card className="space-y-4">
          <h3 className="font-semibold text-white text-base">3. Conditional Routing Logic</h3>
          <RuleEditor rules={rules} onChange={setRules} />
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/workflows"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkflowPage;
