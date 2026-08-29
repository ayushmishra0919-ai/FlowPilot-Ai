import React from 'react';
import { Headphones, Sparkles, AlertTriangle, DollarSign, Server, Zap } from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    id: 'lead-core',
    category: 'Enterprise Demo Lead',
    icon: Sparkles,
    color: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/30 hover:bg-indigo-950/50 ring-1 ring-indigo-500/30',
    text: 'Rahul from ABC Technologies wants an enterprise product demo. Please notify the sales team.'
  },
  {
    id: 'support-1',
    category: 'Customer Support',
    icon: Headphones,
    color: 'border-blue-500/30 text-blue-400 bg-blue-950/20 hover:bg-blue-950/40',
    text: 'Customer Rahul has not received his order for 5 days. Please contact him and mark this as urgent.'
  },
  {
    id: 'lead-1',
    category: 'Sales Prospect (200 Seats)',
    icon: Sparkles,
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40',
    text: 'Priya from TechCorp Global wants pricing information and an enterprise demo for 200 seats.'
  },
  {
    id: 'complaint-1',
    category: 'Complaint / Escalation',
    icon: AlertTriangle,
    color: 'border-rose-500/30 text-rose-400 bg-rose-950/20 hover:bg-rose-950/40',
    text: 'Customer is extremely unhappy because the package arrived broken and damaged. Demanding immediate refund.'
  },
  {
    id: 'devops-1',
    category: 'DevOps / Internal Alert',
    icon: Server,
    color: 'border-purple-500/30 text-purple-400 bg-purple-950/20 hover:bg-purple-950/40',
    text: 'DevOps alert: Server memory utilization reached 92% on production cluster us-east-1.'
  }
];

const SamplePrompts = ({ onSelect }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Zap className="w-3.5 h-3.5 text-indigo-400" />
        <span>Try Sample Business Requests (1-Click Test)</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((sample) => {
          const Icon = sample.icon;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect(sample.text)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 hover:scale-[1.02] active:scale-95 text-left ${sample.color}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{sample.category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SamplePrompts;
