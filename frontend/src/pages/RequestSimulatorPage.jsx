import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Bot,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  Mail,
  Table,
  Terminal,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import SamplePrompts from '../components/simulator/SamplePrompts';
import LiveExecutionStepper from '../components/simulator/LiveExecutionStepper';
import JsonViewer from '../components/execution/JsonViewer';
import ExecutionTimeline from '../components/execution/ExecutionTimeline';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const RequestSimulatorPage = () => {
  const [searchParams] = useSearchParams();
  const initialWorkflowId = searchParams.get('workflowId') || '';

  const [message, setMessage] = useState('Rahul from ABC Technologies wants an enterprise product demo. Please notify the sales team.');
  const [source, setSource] = useState('request_simulator');
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(initialWorkflowId);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [executionResult, setExecutionResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await api.get('/workflows');
        setWorkflows(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load workflows:', err);
      }
    };
    fetchWorkflows();
  }, []);

  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a business request to simulate.');
      return;
    }

    setLoading(true);
    setExecutionResult(null);
    setCurrentStep(0);

    // 6-step visual progression
    const step1 = setTimeout(() => setCurrentStep(1), 120);
    const step2 = setTimeout(() => setCurrentStep(2), 260);
    const step3 = setTimeout(() => setCurrentStep(3), 400);
    const step4 = setTimeout(() => setCurrentStep(4), 540);

    try {
      const url = selectedWorkflowId
        ? `/webhook/request?workflowId=${selectedWorkflowId}`
        : '/webhook/request';

      const res = await api.post(url, {
        message: message.trim(),
        source: source || 'simulator_interactive'
      });

      setCurrentStep(5);
      setExecutionResult(res.data);
      toast.success(`Workflow completed successfully (${res.data.durationMs}ms)`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Workflow execution failed.');
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
      setLoading(false);
    }
  };

  const ai = executionResult?.aiAnalysis;
  const route = executionResult?.route;
  const actionRes = executionResult?.actionResult;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Automation Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Request Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit realistic unstructured requests and watch FlowPilot AI classify, route, and execute in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Break Live Mode
          </Badge>
        </div>
      </div>

      {/* Simulator Form Card */}
      <Card className="space-y-6">
        {/* Sample Prompt Chips */}
        <SamplePrompts onSelect={(text) => setMessage(text)} />

        {/* Input Textarea & Configuration */}
        <form onSubmit={handleRunSimulation} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Enter Unstructured Business Request *
              </label>
              <span className="text-slate-400 font-mono">{message.length} chars</span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Rahul from ABC Technologies wants an enterprise product demo. Please notify the sales team."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-sans transition-colors leading-relaxed shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Target Pipeline (Optional)</label>
              <select
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              >
                <option value="">Default Active Workflow (Auto-Select)</option>
                {workflows.map((wf) => (
                  <option key={wf._id || wf.id} value={wf._id || wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Simulation Inbound Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="website_widget / email / api"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Run Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Workflow Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>RUN FLOWPILOT AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* Execution Stepper */}
      {(loading || executionResult) && (
        <LiveExecutionStepper
          currentStep={currentStep}
          isComplete={Boolean(executionResult && !loading)}
          result={executionResult}
        />
      )}

      {/* Results Dashboard */}
      {executionResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Result Summary Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Execution Completed Successfully</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Execution ID: {executionResult.executionId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={ai?.intent} size="md">
                  {ai?.intent}
                </Badge>
                <Badge variant={ai?.priority} size="md">
                  Priority: {ai?.priority}
                </Badge>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {executionResult.durationMs} ms
                </span>
              </div>
            </div>

            {/* AI Analysis Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>AI Structuring & Entity Extraction</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                  <span className="font-semibold text-white text-sm">{ai?.customer_name || 'Unknown'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Company</span>
                  <span className="font-semibold text-white text-sm">{ai?.company || 'None detected'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                  <span className="font-semibold text-white text-sm capitalize">{ai?.category?.replace(/_/g, ' ')}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Confidence</span>
                  <span className="font-bold text-emerald-400 text-sm">{Math.round((ai?.confidence || 0.95) * 100)}%</span>
                </div>
              </div>

              {/* AI Summary Box */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                <span className="text-[11px] font-bold text-indigo-400 uppercase">AI Summary</span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">{ai?.summary}</p>
              </div>
            </div>

            {/* Routing Decision Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Routing Switch Decision
                </span>
                <span className="font-mono text-indigo-400 text-[11px]">{route?.matchedRuleId}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                  Condition: {route?.condition}
                </span>
                <span className="text-slate-400">→</span>
                <span className="bg-emerald-950/60 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-bold">
                  Action: {route?.targetAction}
                </span>
              </div>
            </div>

            {/* Action Execution Receipt */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {route?.targetAction?.includes('gmail') ? (
                    <Mail className="w-4 h-4 text-indigo-400" />
                  ) : route?.targetAction?.includes('sheets') ? (
                    <Table className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Terminal className="w-4 h-4 text-purple-400" />
                  )}
                  <span className="font-bold text-white uppercase">
                    Action Output: {route?.targetAction}
                  </span>
                </div>
                <Badge variant={actionRes?.mode === 'LIVE' ? 'success' : 'primary'} size="sm">
                  {actionRes?.mode === 'LIVE' ? 'LIVE EXECUTION' : 'DEMO MODE'}
                </Badge>
              </div>

              {actionRes?.details && (
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
                  {actionRes.details}
                </div>
              )}

              {/* If Gmail alert was dispatched */}
              {actionRes?.subject && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400"><strong className="text-slate-300">Recipient:</strong> {actionRes.recipient}</div>
                  <div className="text-slate-400"><strong className="text-slate-300">Subject:</strong> {actionRes.subject}</div>
                </div>
              )}

              {/* If Google Sheet was updated */}
              {actionRes?.rowInserted && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-800 rounded-lg overflow-hidden">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        <th className="p-2.5 border-b border-slate-800">Timestamp</th>
                        <th className="p-2.5 border-b border-slate-800">Name</th>
                        <th className="p-2.5 border-b border-slate-800">Email</th>
                        <th className="p-2.5 border-b border-slate-800">Company</th>
                        <th className="p-2.5 border-b border-slate-800">Intent</th>
                        <th className="p-2.5 border-b border-slate-800">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300 bg-slate-950">
                      <tr>
                        <td className="p-2.5 text-slate-400">{actionRes.rowInserted.timestamp}</td>
                        <td className="p-2.5 font-bold text-white">{actionRes.rowInserted.name}</td>
                        <td className="p-2.5 text-indigo-400">{actionRes.rowInserted.email}</td>
                        <td className="p-2.5">{actionRes.rowInserted.company}</td>
                        <td className="p-2.5"><Badge variant={actionRes.rowInserted.intent} size="sm">{actionRes.rowInserted.intent}</Badge></td>
                        <td className="p-2.5"><Badge variant={actionRes.rowInserted.priority} size="sm">{actionRes.rowInserted.priority}</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Split: Structured JSON and Execution Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Validated Schema Output
                </span>
                <JsonViewer data={ai} maxHeight="max-h-60" />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Micro-Step Timeline
                </span>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <ExecutionTimeline timeline={executionResult.timeline} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestSimulatorPage;
