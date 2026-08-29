import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, PlusCircle, Search, Filter, RefreshCw, PlayCircle } from 'lucide-react';
import WorkflowCard from '../components/workflow/WorkflowCard';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const WorkflowsPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const toast = useToast();

  const fetchWorkflows = async () => {
    try {
      const res = await api.get('/workflows');
      setWorkflows(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load workflows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/workflows/${id}/status`);
      toast.success(res.data?.message || 'Workflow status updated.');
      fetchWorkflows();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleQuickTest = (workflow) => {
    window.location.href = `/simulator?workflowId=${workflow._id || workflow.id}`;
  };

  const filtered = workflows.filter((w) => {
    const matchesSearch =
      (w.name && w.name.toLowerCase().includes(search.toLowerCase())) ||
      (w.description && w.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      filterStatus === 'ALL' || w.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configured Workflows
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage automation pipelines, webhook endpoints, AI models, and conditional routing rules.
          </p>
        </div>

        <Link
          to="/workflows/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Workflow</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows by title or description..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 hidden sm:inline">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <GitBranch className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">No workflows matched your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new automation pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((workflow) => (
            <WorkflowCard
              key={workflow._id || workflow.id}
              workflow={workflow}
              onToggleStatus={handleToggleStatus}
              onQuickTest={handleQuickTest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;
