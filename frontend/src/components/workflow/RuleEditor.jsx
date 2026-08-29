import React from 'react';
import { Plus, Trash2, GitBranch, ArrowRight, ShieldCheck, Mail, Table, Terminal, Zap } from 'lucide-react';

const INTENT_OPTIONS = [
  { value: 'customer_support', label: 'Customer Support' },
  { value: 'lead', label: 'Lead' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'sales', label: 'Sales' },
  { value: 'internal_request', label: 'Internal Request' },
  { value: 'notification', label: 'Notification' },
  { value: 'general', label: 'General' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const ACTION_OPTIONS = [
  { value: 'gmail_notification', label: 'Send Standard Gmail Notification', icon: Mail },
  { value: 'priority_gmail', label: 'Send High-Priority Escalation Email', icon: Mail },
  { value: 'google_sheets_insert', label: 'Append Row to Google Sheets CRM', icon: Table },
  { value: 'n8n_trigger', label: 'Forward to n8n Automation Webhook', icon: Zap },
  { value: 'internal_log', label: 'Archive in Database / Internal Log', icon: Terminal },
];

const RuleEditor = ({ rules = [], onChange }) => {
  const addRule = () => {
    const newRule = {
      id: `rule-${Date.now()}`,
      conditionField: 'intent',
      conditionOperator: 'equals',
      conditionValue: 'customer_support',
      action: 'gmail_notification',
      actionParams: {
        recipient: 'support@flowpilot.ai',
        subject: '[FlowPilot Alert] {summary}'
      }
    };
    onChange([...rules, newRule]);
  };

  const removeRule = (id) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id, field, value) => {
    onChange(
      rules.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [field]: value };
          // Set sensible actionParams defaults when changing action
          if (field === 'action') {
            if (value === 'gmail_notification' || value === 'priority_gmail') {
              updated.actionParams = {
                recipient: value === 'priority_gmail' ? 'escalations@flowpilot.ai' : 'support@flowpilot.ai',
                subject: value === 'priority_gmail' ? '🚨 [FlowPilot Priority] {summary}' : '[FlowPilot Alert] {summary}'
              };
            } else if (value === 'google_sheets_insert') {
              updated.actionParams = { sheetName: 'Inbound Leads 2026' };
            } else if (value === 'n8n_trigger') {
              updated.actionParams = { targetWorkflow: 'n8n_flowpilot_pipeline' };
            }
          }
          return updated;
        }
        return r;
      })
    );
  };

  const updateParam = (id, paramKey, paramVal) => {
    onChange(
      rules.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            actionParams: {
              ...r.actionParams,
              [paramKey]: paramVal
            }
          };
        }
        return r;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Conditional Routing Rules</h4>
          <p className="text-xs text-slate-400">
            Rules are evaluated in sequential order against structured AI entities.
          </p>
        </div>
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <GitBranch className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No custom rules added yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            System intelligent default fallback routing will be applied automatically.
          </p>
          <button
            type="button"
            onClick={addRule}
            className="mt-4 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Create First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => {
            const isIntentField = rule.conditionField === 'intent';
            const isPriorityField = rule.conditionField === 'priority';

            return (
              <div
                key={rule.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 transition-all hover:border-slate-700"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Rule #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* IF - THEN Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                  {/* IF Label */}
                  <div className="md:col-span-1 font-bold text-slate-400 uppercase">IF</div>

                  {/* Condition Field */}
                  <div className="md:col-span-3">
                    <select
                      value={rule.conditionField}
                      onChange={(e) => updateRule(rule.id, 'conditionField', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                    >
                      <option value="intent">AI Intent</option>
                      <option value="priority">Priority Urgency</option>
                      <option value="sentiment">Sentiment</option>
                      <option value="category">Category</option>
                    </select>
                  </div>

                  {/* Operator */}
                  <div className="md:col-span-2">
                    <select
                      value={rule.conditionOperator}
                      onChange={(e) => updateRule(rule.id, 'conditionOperator', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                    >
                      <option value="equals">equals (==)</option>
                      <option value="not_equals">not equals (!=)</option>
                      <option value="contains">contains</option>
                    </select>
                  </div>

                  {/* Condition Value */}
                  <div className="md:col-span-3">
                    {isIntentField ? (
                      <select
                        value={rule.conditionValue}
                        onChange={(e) => updateRule(rule.id, 'conditionValue', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                      >
                        {INTENT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : isPriorityField ? (
                      <select
                        value={rule.conditionValue}
                        onChange={(e) => updateRule(rule.id, 'conditionValue', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                      >
                        {PRIORITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={rule.conditionValue}
                        onChange={(e) => updateRule(rule.id, 'conditionValue', e.target.value)}
                        placeholder="e.g. delivery_issue"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    )}
                  </div>

                  {/* THEN Label */}
                  <div className="md:col-span-1 font-bold text-indigo-400 uppercase text-center">
                    THEN
                  </div>

                  {/* Target Action */}
                  <div className="md:col-span-2">
                    <select
                      value={rule.action}
                      onChange={(e) => updateRule(rule.id, 'action', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-semibold text-indigo-300"
                    >
                      {ACTION_OPTIONS.map((act) => (
                        <option key={act.value} value={act.value}>
                          {act.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Action Parameters */}
                {(rule.action === 'gmail_notification' || rule.action === 'priority_gmail') && (
                  <div className="pt-2 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Recipient Email</label>
                      <input
                        type="text"
                        value={rule.actionParams?.recipient || ''}
                        onChange={(e) => updateParam(rule.id, 'recipient', e.target.value)}
                        placeholder="support@flowpilot.ai"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Subject Template</label>
                      <input
                        type="text"
                        value={rule.actionParams?.subject || ''}
                        onChange={(e) => updateParam(rule.id, 'subject', e.target.value)}
                        placeholder="[FlowPilot Alert] {summary}"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {rule.action === 'google_sheets_insert' && (
                  <div className="pt-2 border-t border-slate-800/60 text-xs">
                    <label className="text-[10px] text-slate-400 block mb-1">Target Sheet Name / Tab</label>
                    <input
                      type="text"
                      value={rule.actionParams?.sheetName || ''}
                      onChange={(e) => updateParam(rule.id, 'sheetName', e.target.value)}
                      placeholder="Inbound Leads 2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RuleEditor;
