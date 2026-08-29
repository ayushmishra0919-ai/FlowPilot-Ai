import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bot,
  Mail,
  Table,
  Layers,
  Zap,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Eye,
  User
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingService, setTestingService] = useState(null);
  const [testResult, setTestResult] = useState({});
  const [mockData, setMockData] = useState({ mockGoogleSheet: [], mockGmailInbox: [] });
  const [activeTab, setActiveTab] = useState('integrations'); // 'integrations' | 'ai' | 'mockData' | 'profile'
  const toast = useToast();

  // Form states
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.2);
  const [customPrompt, setCustomPrompt] = useState('');
  const [demoMode, setDemoMode] = useState(true);

  const fetchSettingsData = async () => {
    try {
      const [setRes, mockRes] = await Promise.all([
        api.get('/settings'),
        api.get('/settings/mock-data')
      ]);
      const s = setRes.data?.data;
      setSettings(s);
      setModel(s?.ai?.model || 'gpt-4o-mini');
      setTemperature(s?.ai?.temperature !== undefined ? s.ai.temperature : 0.2);
      setCustomPrompt(s?.ai?.customPrompt || '');
      setDemoMode(s?.demoMode !== false);
      setMockData(mockRes.data?.data || { mockGoogleSheet: [], mockGmailInbox: [] });
    } catch (err) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', {
        ai: {
          model,
          temperature: parseFloat(temperature),
          customPrompt: customPrompt.trim()
        },
        demoMode
      });
      toast.success('Platform configuration saved successfully.');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestIntegration = async (serviceName) => {
    setTestingService(serviceName);
    try {
      const res = await api.post('/settings/test-integration', { service: serviceName });
      setTestResult((prev) => ({ ...prev, [serviceName]: res.data }));
      if (res.data?.status === 'CONNECTED') {
        toast.success(`${serviceName.toUpperCase()} connection verified!`);
      } else {
        toast.info(res.data?.message || 'Integration check complete.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to check ${serviceName}.`);
    } finally {
      setTestingService(null);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading platform configuration...</div>;
  }

  const integrations = settings?.integrations || {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-400" />
          <span>Platform Settings & Integrations</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure OpenAI GPT parameters, external automation credentials, and Demo Mode simulation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'integrations'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Integration Connections
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'ai'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Model & Prompts
        </button>
        <button
          onClick={() => setActiveTab('mockData')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'mockData'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Simulated Store Inspector ({mockData.mockGoogleSheet?.length + mockData.mockGmailInbox?.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          User Profile
        </button>
      </div>

      {/* Tab 1: Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Demo Mode Notice */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">FlowPilot Zero-Break Demo Mode</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  When third-party API credentials are not supplied in <code>.env</code>, FlowPilot seamlessly activates intelligent fallback simulation so everything works out of the box.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4"
              />
              <span>Demo Mode Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OpenAI Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">OpenAI GPT Integration</h3>
                    <span className="text-[11px] text-slate-400">LLM Structuring Engine</span>
                  </div>
                </div>
                <Badge variant={integrations.openai?.configured ? 'success' : 'primary'} size="sm">
                  {integrations.openai?.configured ? 'Key Configured' : 'NLP Fallback Active'}
                </Badge>
              </div>

              <p className="text-xs text-slate-400">
                Uses OpenAI GPT models with structured JSON schemas. When key is absent, FlowPilot's embedded NLP entity engine operates seamlessly.
              </p>

              {testResult.openai && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  {testResult.openai.message}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleTestIntegration('openai')}
                disabled={testingService === 'openai'}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {testingService === 'openai' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Test OpenAI Connection</span>
              </button>
            </Card>

            {/* Gmail Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Gmail Automation</h3>
                    <span className="text-[11px] text-slate-400">Nodemailer SMTP / Alerts</span>
                  </div>
                </div>
                <Badge variant={integrations.gmail?.configured ? 'success' : 'primary'} size="sm">
                  {integrations.gmail?.configured ? 'Connected' : 'Simulated (Demo)'}
                </Badge>
              </div>

              <p className="text-xs text-slate-400">
                Dispatches contextual HTML support alerts and priority customer notifications via Gmail SMTP or into the in-app simulated inbox.
              </p>

              {testResult.gmail && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  {testResult.gmail.message}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleTestIntegration('gmail')}
                disabled={testingService === 'gmail'}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {testingService === 'gmail' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Test Gmail SMTP Connection</span>
              </button>
            </Card>

            {/* Google Sheets Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Table className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Google Sheets Sync</h3>
                    <span className="text-[11px] text-slate-400">Inbound Leads CRM Store</span>
                  </div>
                </div>
                <Badge variant={integrations.googleSheets?.configured ? 'success' : 'primary'} size="sm">
                  {integrations.googleSheets?.configured ? 'Connected' : 'Simulated (Demo)'}
                </Badge>
              </div>

              <p className="text-xs text-slate-400">
                Appends lead details directly to your live Google Sheet or captures structured records inside the in-app table viewer.
              </p>

              {testResult.googleSheets && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  {testResult.googleSheets.message}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleTestIntegration('googleSheets')}
                disabled={testingService === 'googleSheets'}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {testingService === 'googleSheets' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Test Google Sheets API</span>
              </button>
            </Card>

            {/* n8n Automation Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">n8n Automation Engine</h3>
                    <span className="text-[11px] text-slate-400">Multi-Node Pipeline</span>
                  </div>
                </div>
                <Badge variant="primary" size="sm">
                  Workflow Ready
                </Badge>
              </div>

              <p className="text-xs text-slate-400">
                Exports structured payloads to n8n webhooks. Workflow JSON file available under <code>n8n/workflows/</code>.
              </p>

              {testResult.n8n && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  {testResult.n8n.message}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleTestIntegration('n8n')}
                disabled={testingService === 'n8n'}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {testingService === 'n8n' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Test n8n Webhook Listener</span>
              </button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: AI Configuration */}
      {activeTab === 'ai' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card className="space-y-4">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>Global AI Structuring Engine Configuration</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Default Model</label>
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
                    <span>Strict / Deterministic (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Global System Prompt Override
                </label>
                <textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Leave empty to use FlowPilot's strict JSON entity extraction prompt..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save AI Configuration</span>
              </button>
            </div>
          </Card>
        </form>
      )}

      {/* Tab 3: Mock Store Inspector */}
      {activeTab === 'mockData' && (
        <div className="space-y-6">
          {/* Mock Google Sheet */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white text-base">FlowPilot Simulated Google Sheet CRM</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {mockData.mockGoogleSheet?.length || 0} Rows Captured
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Intent</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300 bg-slate-950">
                  {mockData.mockGoogleSheet?.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-slate-900/60">
                      <td className="p-3 text-slate-400">{row.timestamp}</td>
                      <td className="p-3 font-bold text-white font-sans">{row.name}</td>
                      <td className="p-3 text-indigo-400">{row.email}</td>
                      <td className="p-3">{row.company}</td>
                      <td className="p-3"><Badge variant={row.intent} size="sm">{row.intent}</Badge></td>
                      <td className="p-3"><Badge variant={row.priority} size="sm">{row.priority}</Badge></td>
                      <td className="p-3 font-sans text-slate-300 max-w-xs truncate">{row.summary || row.request}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mock Gmail Inbox */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-base">FlowPilot Simulated Sent Mailbox</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {mockData.mockGmailInbox?.length || 0} Emails Dispatched
              </span>
            </div>

            {mockData.mockGmailInbox?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No simulated emails recorded yet. Trigger a customer support request in the simulator!
              </div>
            ) : (
              <div className="space-y-3">
                {mockData.mockGmailInbox?.map((mail, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{mail.subject}</span>
                      <span className="font-mono text-slate-400 text-[10px]">{new Date(mail.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-400">
                      <strong>To:</strong> {mail.recipient} | <strong>From:</strong> {mail.sender}
                    </div>
                    <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-slate-300 font-mono whitespace-pre-line text-[11px]">
                      {mail.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 4: Profile */}
      {activeTab === 'profile' && (
        <Card className="space-y-4 max-w-xl">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>Administrator Profile</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 block">Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Alex Vance'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 opacity-80"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'demo@flowpilot.ai'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 opacity-80"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">Role</label>
              <input
                type="text"
                disabled
                value="Platform Administrator"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 opacity-80"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
