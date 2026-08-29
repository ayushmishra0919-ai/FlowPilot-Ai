import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowDown } from 'lucide-react';

const ExecutionTimeline = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-xs text-slate-400">No timeline events recorded.</p>;
  }

  const formatStepName = (step) => {
    switch (step) {
      case 'WEBHOOK_RECEIVED':
        return 'Inbound Webhook Received';
      case 'AI_STRUCTURING':
        return 'AI Intent & Entity Structuring';
      case 'CONDITIONAL_ROUTING':
        return 'Conditional Switch Evaluated';
      case 'ACTION_EXECUTION':
        return 'Integration Action Executed';
      case 'LOG_RECORDED':
        return 'Execution Saved to Telemetry DB';
      default:
        return step.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-3 relative pl-4 border-l-2 border-slate-800 ml-2">
      {timeline.map((item, idx) => {
        const isSuccess = item.status === 'SUCCESS';
        const isFailed = item.status === 'FAILED';

        return (
          <div key={idx} className="relative group">
            {/* Step node dot */}
            <div
              className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-slate-950 ${
                isSuccess
                  ? 'border-emerald-500 text-emerald-400'
                  : isFailed
                  ? 'border-rose-500 text-rose-400'
                  : 'border-indigo-500 text-indigo-400'
              }`}
            >
              {isSuccess ? (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ) : isFailed ? (
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </div>

            {/* Step Info */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {formatStepName(item.step)}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  {item.durationMs !== undefined && (
                    <span className="text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      {item.durationMs}ms
                    </span>
                  )}
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {item.details && (
                <p className="text-xs text-slate-400 break-words font-mono">
                  {item.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExecutionTimeline;
