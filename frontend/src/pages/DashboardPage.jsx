import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Activity,
  Zap,
  TrendingUp,
  RefreshCw,
  Mail,
  Table,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { SkeletonCard, SkeletonTable } from '../components/common/LoadingSkeleton';
import ExecutionDetailModal from '../components/execution/ExecutionDetailModal';
import api from '../services/api';

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, execsRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/executions?limit=6')
      ]);
      setAnalytics(analyticsRes.data?.data);
      setRecentExecutions(execsRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalRequests: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    successRate: 100,
    totalWorkflows: 3,
    activeWorkflows: 3,
    avgLatencyMs: 380
  };

  const statCards = [
    {
      title: 'Total Workflows',
      value: summary.totalWorkflows,
      sub: `${summary.activeWorkflows} Active Pipeline${summary.activeWorkflows !== 1 ? 's' : ''}`,
      icon: GitBranch,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40 border-indigo-500/30'
    },
    {
      title: 'Requests Processed',
      value: summary.totalRequests,
      sub: 'All Inbound Webhooks',
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-500/30'
    },
    {
      title: 'Successful Executions',
      value: summary.successfulExecutions,
      sub: `${summary.successRate}% Success Rate`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-500/30'
    },
    {
      title: 'Failed Executions',
      value: summary.failedExecutions,
      sub: summary.failedExecutions === 0 ? 'Zero active errors' : 'Requires review',
      icon: XCircle,
      color: summary.failedExecutions > 0 ? 'text-rose-400' : 'text-slate-400',
      bg: summary.failedExecutions > 0 ? 'bg-rose-950/40 border-rose-500/30' : 'bg-slate-900 border-slate-800'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Automation Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time pipeline metrics, execution telemetry, and workflow monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/workflows/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            <span>New Workflow</span>
          </Link>

          <Link
            to="/simulator"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Run Simulator</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{card.value}</div>
                <span className="text-[11px] text-slate-400 block">{card.sub}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Workflow Health & Live Activity Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Gauge Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Workflow Health</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              Optimal
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Execution Success Rate</span>
                <span className="font-bold text-emerald-400">{summary.successRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${summary.successRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase">Avg Latency</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{summary.avgLatencyMs} ms</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase">Active Pipelines</span>
                <span className="font-mono font-bold text-slate-200 text-sm">{summary.activeWorkflows} Online</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Recent Automation Activity</span>
            </h3>
            <Link to="/logs" className="text-xs text-indigo-400 hover:text-indigo-300">
              View All Logs →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {recentExecutions.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedExecution(item)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-200 font-medium line-clamp-1">
                      {item.aiAnalysis?.summary || item.input?.message}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Routed to: {item.route?.targetAction || item.actionResult?.action}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={item.aiAnalysis?.intent || 'general'} size="sm">
                    {item.aiAnalysis?.intent}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Executions Table */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-white text-base">Recent Workflow Executions</h3>
            <p className="text-xs text-slate-400">
              Click on any row to inspect complete step telemetry, extracted AI entities, and action payloads.
            </p>
          </div>
          <Link
            to="/executions"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
          >
            Full Execution History →
          </Link>
        </div>

        {recentExecutions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No executions logged yet. Run a test from the Request Simulator!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Request Message</th>
                  <th className="p-3">Intent</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Target Action</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentExecutions.map((exec) => (
                  <tr
                    key={exec._id || exec.id}
                    onClick={() => setSelectedExecution(exec)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="p-3 font-medium text-slate-200 max-w-xs truncate group-hover:text-indigo-300">
                      {exec.input?.message || 'Incoming request'}
                    </td>
                    <td className="p-3">
                      <Badge variant={exec.aiAnalysis?.intent || 'general'} size="sm">
                        {exec.aiAnalysis?.intent || 'general'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={exec.aiAnalysis?.priority || 'medium'} size="sm">
                        {exec.aiAnalysis?.priority || 'medium'}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {exec.route?.targetAction || exec.actionResult?.action || 'internal_log'}
                    </td>
                    <td className="p-3">
                      <Badge variant={exec.status} size="sm">
                        {exec.status}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-indigo-400">
                      {exec.durationMs || 0}ms
                    </td>
                    <td className="p-3 text-right text-slate-400 font-mono">
                      {new Date(exec.createdAt || exec.input?.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Drill-down Modal */}
      <ExecutionDetailModal
        execution={selectedExecution}
        isOpen={Boolean(selectedExecution)}
        onClose={() => setSelectedExecution(null)}
      />
    </div>
  );
};

export default DashboardPage;
