import React from 'react';
import { Webhook, Bot, GitFork, Mail, Table, Database, Terminal, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const VisualFlowchart = ({ activeRoute = null }) => {
  const steps = [
    {
      id: 'webhook',
      title: 'Inbound Webhook',
      subtitle: 'REST JSON / API Trigger',
      icon: Webhook,
      color: 'from-blue-600 to-cyan-500',
      badge: 'Step 1'
    },
    {
      id: 'ai',
      title: 'OpenAI GPT Analysis',
      subtitle: 'Structured JSON & Entities',
      icon: Bot,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Step 2'
    },
    {
      id: 'router',
      title: 'Conditional Router',
      subtitle: 'Rule & Intent Switch',
      icon: GitFork,
      color: 'from-amber-600 to-orange-500',
      badge: 'Step 3'
    },
    {
      id: 'action',
      title: 'Integration Dispatch',
      subtitle: 'Gmail / Google Sheets / n8n',
      icon: Mail,
      color: 'from-emerald-600 to-teal-500',
      badge: 'Step 4'
    },
    {
      id: 'log',
      title: 'Execution Log',
      subtitle: 'Real-time Telemetry & DB',
      icon: Terminal,
      color: 'from-slate-700 to-slate-800',
      badge: 'Step 5'
    }
  ];

  return (
    <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
      {/* Background glow accents */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex-1 w-full md:w-auto bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {step.badge}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {step.subtitle}
                </p>
              </div>

              {!isLast && (
                <div className="hidden md:flex items-center justify-center shrink-0 text-slate-400">
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default VisualFlowchart;
