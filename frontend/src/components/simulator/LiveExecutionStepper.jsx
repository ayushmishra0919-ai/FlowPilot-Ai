import React from 'react';
import { CheckCircle2, Loader2, Webhook, Bot, Sparkles, GitBranch, Send, Check } from 'lucide-react';

const LiveExecutionStepper = ({ currentStep = 0, isComplete = false, result = null }) => {
  const steps = [
    { label: 'RECEIVED', icon: Webhook, desc: 'Webhook Payload Ingested' },
    { label: 'AI PROCESSING', icon: Bot, desc: 'LLM Extraction Prompt' },
    { label: 'ANALYZED', icon: Sparkles, desc: 'Strict Schema Validated' },
    { label: 'ROUTED', icon: GitBranch, desc: 'Conditional Rule Match' },
    { label: 'ACTION EXECUTED', icon: Send, desc: result?.action ? `Dispatched ${result.action}` : 'Target Action Dispatch' },
    { label: 'COMPLETED', icon: CheckCircle2, desc: 'Execution Record Saved' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          Live Execution Pipeline Stepper
        </h4>
        {isComplete && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED ({result?.durationMs || 0}ms)
          </span>
        )}
      </div>

      {/* 6 Steps Track */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = isComplete || idx < currentStep;
          const isCurrent = !isComplete && idx === currentStep;

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all duration-300 relative flex flex-col justify-between ${
                isPassed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/20 animate-pulse'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
                  Step {idx + 1}
                </span>
                {isPassed ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Check className="w-3 h-3" />
                  </div>
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span className="text-xs font-bold truncate">{step.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight truncate">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveExecutionStepper;
