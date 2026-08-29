import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Copy, Check, Power, MoreVertical, GitBranch, ArrowRight, Zap, CheckCircle2, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import Card from '../common/Card';

const WorkflowCard = ({ workflow, onToggleStatus, onQuickTest }) => {
  const [copied, setCopied] = useState(false);

  const copyWebhook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}${workflow.webhookUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = workflow.status === 'active';
  const total = workflow.stats?.totalExecutions || 0;
  const success = workflow.stats?.successfulExecutions || 0;
  const rate = total > 0 ? ((success / total) * 100).toFixed(0) : 100;

  return (
    <Card hover className="flex flex-col justify-between group relative overflow-hidden">
      {/* Top Bar */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {workflow.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                {workflow.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <Badge variant={isActive ? 'active' : 'paused'} size="sm">
            {isActive ? 'Active' : 'Paused'}
          </Badge>
        </div>

        {/* Webhook Endpoint Pill */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400">
          <span className="truncate">{workflow.webhookUrl}</span>
          <button
            onClick={copyWebhook}
            title="Copy Webhook Endpoint"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Rules Summary */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{workflow.configuration?.rules?.length || 0} Routing Rules Configured</span>
        </div>
      </div>

      {/* Bottom Metrics & Actions */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
            <span className="text-slate-400 block text-[10px]">Executions</span>
            <span className="font-bold text-slate-200 text-sm">{total}</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
            <span className="text-slate-400 block text-[10px]">Success Rate</span>
            <span className="font-bold text-emerald-400 text-sm">{rate}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onToggleStatus(workflow._id || workflow.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isActive
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isActive ? 'Pause' : 'Activate'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickTest(workflow)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span>Test</span>
            </button>
            <Link
              to={`/workflows/${workflow._id || workflow.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WorkflowCard;
