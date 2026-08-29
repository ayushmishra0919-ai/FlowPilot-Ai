import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Power,
  Copy,
  Check,
  Play,
  Trash2,
  GitBranch,
  Bot,
  Terminal,
  Activity,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import VisualFlowchart from '../components/workflow/VisualFlowchart';
import ExecutionDetailModal from '../components/execution/ExecutionDetailModal';
import { SkeletonCard, SkeletonTable } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const WorkflowDetailPage = () => {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [wfRes, execsRes] = await Promise.all([
        api.get(`/workflows/${id}`),
        api.get(`/executions?workflowId=${id}&limit=10`)
      ]);
      setWorkflow(wfRes.data?.data);
      setExecutions(execsRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load workflow details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleToggleStatus = async () => {
    try {
      const res = await api.patch(`/workflows/${id}/status`);
      toast.success(res.data?.message || 'Status updated.');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      toast.success('Workflow removed.');
      navigate('/workflows');
    } catch (err) {
      toast.error('Failed to delete workflow.');
    }
  };

  const copyWebhook = () => {
    const fullUrl = `${window.location.origin}${workflow.webhookUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-white">Workflow Not Found</h2>
        <Link to="/workflows" className="text-xs text-indigo-400 hover:underline">
          Return to Workflows
        </Link>
      </div>
    );
  }

  const isActive = workflow.status === 'active';
  const total = workflow.stats?.totalExecutions || 0;
  const success = workflow.stats?.successfulExecutions || 0;
  const rate = total > 0 ? ((success / total) * 100).toFixed(0) : 100;
  const fullWebhookUrl = `${window.location.origin}${workflow.webhookUrl}`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/workflows"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Workflows</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isActive
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isActive ? 'Pause Workflow' : 'Activate Workflow'}</span>
          </button>

          <Link
            to={`/simulator?workflowId=${workflow._id || workflow.id}`}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Test</span>
          </Link>

          <button
            onClick={handleDelete}
            title="Delete Workflow"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors border border-slate-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{workflow.name}</h1>
              <Badge variant={isActive ? 'active' : 'paused'} size="sm">
                {isActive ? 'Active' : 'Paused'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {workflow.description || 'No description configured.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Total Executions</span>
            <span className="font-bold text-white text-base">{total}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Success Rate</span>
            <span className="font-bold text-emerald-400 text-base">{rate}%</span>
          </div>
        </div>
      </div>

      {/* Webhook Endpoint Curl Box */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Dedicated Inbound Webhook Endpoint</span>
          </h3>
          <button
            onClick={copyWebhook}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Endpoint URL'}</span>
          </button>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 break-all select-all">
          {fullWebhookUrl}
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl font-mono text-[11px] text-slate-400 space-y-1">
          <div className="text-slate-400 font-sans font-semibold text-xs">Sample cURL Command:</div>
          <pre className="text-indigo-300 overflow-x-auto">
{`curl -X POST "${fullWebhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Customer Rahul order delayed 5 days", "source": "curl_api"}'`}
          </pre>
        </div>
      </Card>

      {/* Visual Pipeline Flowchart */}
      <VisualFlowchart />

      {/* Rules Breakdown */}
      <Card className="space-y-4">
        <h3 className="font-semibold text-white text-base">Configured Routing Rules</h3>
        <div className="space-y-2">
          {workflow.configuration?.rules?.map((rule, idx) => (
            <div
              key={rule.id || idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 font-mono">
                <span className="text-indigo-400 font-bold uppercase">IF</span>
                <span className="bg-slate-900 px-2 py-1 rounded text-slate-200 border border-slate-800">
                  {rule.conditionField} {rule.conditionOperator} "{rule.conditionValue}"
                </span>
                <span className="text-slate-400">→</span>
                <span className="text-indigo-400 font-bold uppercase">THEN</span>
                <span className="bg-emerald-950/50 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30 font-bold">
                  {rule.action}
                </span>
              </div>

              {rule.actionParams && (
                <div className="text-slate-400 text-[11px]">
                  {rule.actionParams.recipient && `To: ${rule.actionParams.recipient}`}
                  {rule.actionParams.sheetName && `Sheet: ${rule.actionParams.sheetName}`}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Workflow Recent Executions */}
      <Card className="space-y-4">
        <h3 className="font-semibold text-white text-base">Recent Executions for this Pipeline</h3>

        {executions.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No executions for this workflow yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Request Message</th>
                  <th className="p-3">Intent</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {executions.map((exec) => (
                  <tr
                    key={exec._id || exec.id}
                    onClick={() => setSelectedExecution(exec)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-medium text-slate-200 max-w-xs truncate">
                      {exec.input?.message}
                    </td>
                    <td className="p-3">
                      <Badge variant={exec.aiAnalysis?.intent || 'general'} size="sm">
                        {exec.aiAnalysis?.intent}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={exec.aiAnalysis?.priority || 'medium'} size="sm">
                        {exec.aiAnalysis?.priority}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {exec.route?.targetAction || exec.actionResult?.action}
                    </td>
                    <td className="p-3">
                      <Badge variant={exec.status} size="sm">
                        {exec.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {new Date(exec.createdAt || exec.input?.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ExecutionDetailModal
        execution={selectedExecution}
        isOpen={Boolean(selectedExecution)}
        onClose={() => setSelectedExecution(null)}
      />
    </div>
  );
};

export default WorkflowDetailPage;
