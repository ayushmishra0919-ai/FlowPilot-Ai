import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  PlusCircle,
  PlayCircle,
  History,
  BarChart3,
  Terminal,
  Settings,
  HelpCircle,
  Layers
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Workflows', path: '/workflows', icon: GitBranch },
    { label: 'Create Workflow', path: '/workflows/new', icon: PlusCircle },
    { label: 'Request Simulator', path: '/simulator', icon: PlayCircle, highlight: true },
    { label: 'Execution History', path: '/executions', icon: History },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Live Logs', path: '/logs', icon: Terminal },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-800 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Automation Hub
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                        : item.highlight
                        ? 'text-slate-200 hover:bg-slate-900/80 hover:text-white group'
                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Live
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Integration Status Quick Widget */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>Integrations</span>
            <span className="text-[10px] text-emerald-400 font-mono">4 Connected</span>
          </div>
          <div className="space-y-2 text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                OpenAI GPT
              </span>
              <span className="text-[10px] text-slate-400">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Gmail Alert
              </span>
              <span className="text-[10px] text-slate-400">Simulated</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Google Sheets
              </span>
              <span className="text-[10px] text-slate-400">Simulated</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                n8n Webhook
              </span>
              <span className="text-[10px] text-slate-400">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 px-2 flex items-center justify-between text-xs text-slate-400">
        <span>FlowPilot AI v1.0</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Online
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
