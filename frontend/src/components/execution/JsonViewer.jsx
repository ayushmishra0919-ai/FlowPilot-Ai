import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const JsonViewer = ({ data, maxHeight = 'max-h-96', className = '' }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden ${className}`}>
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-400">Structured JSON Output</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy JSON'}</span>
        </button>
      </div>

      <div className={`p-4 font-mono text-xs text-indigo-300 overflow-auto ${maxHeight} leading-relaxed`}>
        <pre className="whitespace-pre">{jsonString}</pre>
      </div>
    </div>
  );
};

export default JsonViewer;
