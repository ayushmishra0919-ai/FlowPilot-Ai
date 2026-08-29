import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ExecutionDetailModal from '../components/execution/ExecutionDetailModal';
import { SkeletonTable } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const ExecutionHistoryPage = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [intentFilter, setIntentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const toast = useToast();

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      let query = `/executions?page=${page}&limit=12`;
      if (statusFilter !== 'ALL') query += `&status=${statusFilter}`;
      if (intentFilter !== 'ALL') query += `&intent=${intentFilter}`;
      if (priorityFilter !== 'ALL') query += `&priority=${priorityFilter}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get(query);
      setExecutions(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalCount(res.data?.total || 0);
    } catch (err) {
      toast.error('Failed to load execution history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [page, statusFilter, intentFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExecutions();
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all execution records?')) return;
    try {
      await api.delete('/executions');
      toast.success('Execution logs reset.');
      fetchExecutions();
    } catch (err) {
      toast.error('Failed to clear execution logs.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Execution History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit trail of all inbound webhooks, AI classifications, routing decisions, and action payloads ({totalCount} total).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExecutions}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, customer name, summary, or Execution ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Intent */}
            <select
              value={intentFilter}
              onChange={(e) => { setIntentFilter(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Intents</option>
              <option value="customer_support">Customer Support</option>
              <option value="lead">Lead</option>
              <option value="complaint">Complaint</option>
              <option value="sales">Sales</option>
              <option value="internal_request">Internal</option>
              <option value="general">General</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Executions Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={8} />
        ) : executions.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <History className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">No execution records found</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your active filters or simulate a new request.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Execution ID</th>
                  <th className="p-3.5">Request / Summary</th>
                  <th className="p-3.5">Intent</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Action Executed</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {executions.map((exec) => (
                  <tr
                    key={exec._id || exec.id}
                    onClick={() => setSelectedExecution(exec)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 font-mono text-indigo-400 group-hover:underline">
                      {exec._id || exec.id}
                    </td>
                    <td className="p-3.5 text-slate-200 max-w-xs truncate">
                      {exec.aiAnalysis?.summary || exec.input?.message}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={exec.aiAnalysis?.intent || 'general'} size="sm">
                        {exec.aiAnalysis?.intent || 'general'}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={exec.aiAnalysis?.priority || 'medium'} size="sm">
                        {exec.aiAnalysis?.priority || 'medium'}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {exec.route?.targetAction || exec.actionResult?.action || 'internal_log'}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={exec.status} size="sm">
                        {exec.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {exec.durationMs || 0}ms
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-400">
                      {new Date(exec.createdAt || exec.input?.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      <ExecutionDetailModal
        execution={selectedExecution}
        isOpen={Boolean(selectedExecution)}
        onClose={() => setSelectedExecution(null)}
      />
    </div>
  );
};

export default ExecutionHistoryPage;
