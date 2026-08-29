import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  GitBranch
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { SkeletonCard, SkeletonTable } from '../components/common/LoadingSkeleton';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#a855f7', '#06b6d4', '#64748b'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data?.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  const summary = data?.summary || {};
  const intentDistribution = data?.intentDistribution || [];
  const priorityDistribution = data?.priorityDistribution || [];
  const requestsOverTime = data?.requestsOverTime || [];
  const workflowPerformance = data?.workflowPerformance || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Telemetry & Automation Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Aggregated insights, intent breakdowns, daily volumes, and routing efficiency metrics.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Inbound Requests</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{summary.totalRequests}</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            100% Ingestion Efficiency
          </span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Overall Success Rate</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{summary.successRate}%</div>
          <span className="text-[10px] text-slate-400">
            {summary.successfulExecutions} Succeeded / {summary.failedExecutions} Failed
          </span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Most Prevalent Intent</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 truncate">
            {summary.mostCommonIntent}
          </div>
          <span className="text-[10px] text-slate-400">Classified via OpenAI & NLP</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Average Processing Latency</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">
            {summary.avgLatencyMs} ms
          </div>
          <span className="text-[10px] text-slate-400">Webhook to Action Dispatch</span>
        </Card>
      </div>

      {/* Charts Row 1: Volume Over Time & Intent Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Request Volume (Area Chart) */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white text-base">Request Ingestion Volume</h3>
              <p className="text-xs text-slate-400">Daily business requests processed over the last 7 days</p>
            </div>
            <Badge variant="primary" size="sm">Last 7 Days</Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#volumeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Intent Distribution (Pie Chart) */}
        <Card className="space-y-4">
          <div>
            <h3 className="font-semibold text-white text-base">Intent Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of classified request intents</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentDistribution}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {intentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {intentDistribution.slice(0, 4).map((item, idx) => (
              <div key={item.intent} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300">{item.label}</span>
                </div>
                <span className="font-mono text-slate-400">{item.percentage}% ({item.count})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Priority Breakdown & Workflow Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card className="space-y-4">
          <h3 className="font-semibold text-white text-base">Requests by Priority Level</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Workflow Performance Table */}
        <Card className="space-y-4">
          <h3 className="font-semibold text-white text-base">Pipeline Reliability Breakdown</h3>
          <div className="divide-y divide-slate-800/80">
            {workflowPerformance.map((wf) => (
              <div key={wf.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-medium text-slate-200 block">{wf.name}</span>
                  <span className="text-[10px] text-slate-400">{wf.totalExecutions} Executions Logged</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 font-mono text-sm">{wf.successRate}%</span>
                  <span className="text-[10px] text-slate-400 block">Success Rate</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
