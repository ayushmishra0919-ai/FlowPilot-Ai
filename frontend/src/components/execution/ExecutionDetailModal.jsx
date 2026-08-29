import React, { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import JsonViewer from './JsonViewer';
import ExecutionTimeline from './ExecutionTimeline';
import { Mail, Table, Bot, GitBranch, Clock, CheckCircle2, XCircle, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';

const ExecutionDetailModal = ({ execution, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'json' | 'timeline' | 'action'

  if (!execution) return null;

  const isSuccess = execution.status === 'COMPLETED';
  const ai = execution.aiAnalysis || {};
  const route = execution.route || {};
  const actionRes = execution.actionResult || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Execution Details — ${execution._id || execution.id}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Status Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3">
            <Badge variant={execution.status} size="lg">
              {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {execution.status}
            </Badge>
            <Badge variant={ai.intent} size="md">
              {ai.intent}
            </Badge>
            <Badge variant={ai.priority} size="md">
              Priority: {ai.priority}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{execution.durationMs || 0} ms</span>
            </div>
            <span>{new Date(execution.createdAt || execution.input?.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Entities
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'action'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Action Output Preview
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Execution Timeline ({execution.timeline?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Structured AI JSON
          </button>
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Raw Incoming Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Original Incoming Message
              </label>
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans">
                "{execution.input?.message}"
              </div>
            </div>

            {/* AI Extracted Entities Grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                AI Extracted Entities & Classification
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Customer</span>
                  <span className="font-semibold text-slate-200">{ai.customer_name || 'Unknown'}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Company</span>
                  <span className="font-semibold text-slate-200">{ai.company || 'None'}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                  <span className="font-semibold text-slate-200 capitalize">{(ai.category || 'General').replace(/_/g, ' ')}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">AI Confidence</span>
                  <span className="font-semibold text-emerald-400">{Math.round((ai.confidence || 0.95) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Bot className="w-4 h-4" />
                <span>AI Executive Summary</span>
              </div>
              <p className="text-xs text-slate-200">{ai.summary}</p>
            </div>

            {/* Routing Decision */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                  Routing Switch Decision
                </span>
                <span className="text-indigo-400 font-mono text-[11px]">{route.matchedRuleId || 'Rule Matched'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  Condition: {route.condition || 'intent == ' + ai.intent}
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold">
                  Action: {route.targetAction || 'Executed'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Action Output */}
        {activeTab === 'action' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-indigo-900/50 flex items-center justify-center text-indigo-400">
                    {route.targetAction?.includes('gmail') ? <Mail className="w-4 h-4" /> : <Table className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">{route.targetAction}</h4>
                    <span className="text-[10px] text-slate-400">Mode: {actionRes.mode || 'DEMO'}</span>
                  </div>
                </div>
                <Badge variant={actionRes.status || 'COMPLETED'} size="sm">
                  {actionRes.status || 'SUCCESS'}
                </Badge>
              </div>

              {actionRes.details && (
                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  {actionRes.details}
                </p>
              )}

              {/* Email preview if Gmail action */}
              {actionRes.subject && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-2">
                  <div className="text-slate-400"><strong>Subject:</strong> {actionRes.subject}</div>
                  <div className="text-slate-400"><strong>To:</strong> {actionRes.recipient || 'support@flowpilot.ai'}</div>
                </div>
              )}

              {/* Sheet row preview if Google Sheets action */}
              {actionRes.rowInserted && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-800">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        <th className="p-2 border-b border-slate-800">Name</th>
                        <th className="p-2 border-b border-slate-800">Email</th>
                        <th className="p-2 border-b border-slate-800">Company</th>
                        <th className="p-2 border-b border-slate-800">Intent</th>
                        <th className="p-2 border-b border-slate-800">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                      <tr>
                        <td className="p-2">{actionRes.rowInserted.name}</td>
                        <td className="p-2">{actionRes.rowInserted.email}</td>
                        <td className="p-2">{actionRes.rowInserted.company}</td>
                        <td className="p-2">{actionRes.rowInserted.intent}</td>
                        <td className="p-2">{actionRes.rowInserted.priority}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Timeline */}
        {activeTab === 'timeline' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <ExecutionTimeline timeline={execution.timeline} />
          </div>
        )}

        {/* Tab: JSON */}
        {activeTab === 'json' && (
          <JsonViewer data={ai} />
        )}
      </div>
    </Modal>
  );
};

export default ExecutionDetailModal;
