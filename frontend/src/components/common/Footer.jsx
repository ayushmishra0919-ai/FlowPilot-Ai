import React from 'react';
import { Zap, Github, BookOpen, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="font-semibold text-slate-300">FlowPilot AI</span>
          <span className="text-slate-400">© 2026. Production Portfolio System.</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Operational
          </div>
          <span>OpenAI + n8n + Gmail + Sheets</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
