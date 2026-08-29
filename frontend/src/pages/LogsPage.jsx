import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Filter, Search, Download, Trash2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import api from '../services/api';

const LogsPage = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/executions?limit=50');
      setExecutions(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = executions.filter((exec) => {
    const matchesFilter =
      activeFilter === 'ALL' || exec.status === activeFilter;

    const matchesSearch =
      !search.trim() ||
      (exec._id && exec._id.toLowerCase().includes(search.toLowerCase())) ||
      (exec.input?.message && exec.input.message.toLowerCase().includes(search.toLowerCase())) ||
      (exec.aiAnalysis?.summary && exec.aiAnalysis.summary.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Terminal className="w-7 h-7 text-indigo-400" />
            <span>Live Telemetry Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time server log stream capturing AI inference, router switch branches, and dispatched integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Stream</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'COMPLETED', 'FAILED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Events' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raw logs..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl font-mono text-xs space-y-3 overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-400">flowpilot-core-telemetry ~ tail -f /var/log/flowpilot.log</span>
          </div>
          <span>{filteredLogs.length} Events Listed</span>
        </div>

        {/* Log Entries Stream */}
        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No matching log records found.
            </div>
          ) : (
            filteredLogs.map((exec) => {
              const isSuccess = exec.status === 'COMPLETED';
              const ai = exec.aiAnalysis || {};

              return (
                <div
                  key={exec._id || exec.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        [{new Date(exec.createdAt || exec.input?.timestamp).toISOString()}]
                      </span>
                      <span className={`font-bold ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isSuccess ? '[INFO:EXEC_SUCCESS]' : '[ERROR:EXEC_FAILED]'}
                      </span>
                      <span className="text-indigo-400 font-semibold">{exec._id || exec.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">duration={exec.durationMs || 0}ms</span>
                      <Badge variant={ai.intent || 'general'} size="sm">
                        intent={ai.intent}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-slate-300 pl-4 border-l-2 border-slate-800 text-[11px] space-y-1">
                    <div>
                      <span className="text-slate-400">PAYLOAD:</span> "{exec.input?.message}"
                    </div>
                    <div>
                      <span className="text-slate-400">ROUTING:</span> Condition [{exec.route?.condition}] → Dispatched [{exec.route?.targetAction}]
                    </div>
                    {exec.actionResult?.details && (
                      <div className="text-emerald-400">
                        <span className="text-slate-400">ACTION_RESULT:</span> {exec.actionResult.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
