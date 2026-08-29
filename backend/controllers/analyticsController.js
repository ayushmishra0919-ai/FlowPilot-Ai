/**
 * FlowPilot AI Analytics & Metrics Controller
 */

const { Executions, Workflows } = require('../services/storeAdapter');
const { INTENTS, PRIORITIES, ACTIONS } = require('../config/constants');

// @route GET /api/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const executions = await Executions.find({});
    const workflows = await Workflows.find({});

    const totalRequests = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'COMPLETED').length;
    const failedExecutions = executions.filter(e => e.status === 'FAILED').length;
    const successRate = totalRequests > 0 ? Number(((successfulExecutions / totalRequests) * 100).toFixed(1)) : 100;

    // 1. Intent Breakdown
    const intentCounts = {};
    Object.values(INTENTS).forEach(i => (intentCounts[i] = 0));

    executions.forEach(e => {
      const intent = e.aiAnalysis?.intent || 'general';
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    });

    const intentDistribution = Object.entries(intentCounts).map(([intent, count]) => ({
      intent,
      label: intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: totalRequests > 0 ? Number(((count / totalRequests) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.count - a.count);

    const mostCommonIntent = intentDistribution[0]?.label || 'Customer Support';

    // 2. Priority Distribution
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    executions.forEach(e => {
      const priority = e.aiAnalysis?.priority || 'medium';
      if (priorityCounts[priority] !== undefined) {
        priorityCounts[priority]++;
      }
    });

    const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
      percentage: totalRequests > 0 ? Number(((count / totalRequests) * 100).toFixed(1)) : 0
    }));

    // 3. Action Distribution
    const actionCounts = {};
    executions.forEach(e => {
      const action = e.route?.targetAction || 'internal_log';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    const actionDistribution = Object.entries(actionCounts).map(([action, count]) => ({
      action,
      label: action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }));

    // 4. Daily Volume / Requests Over Time (Last 7 Days)
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[dateKey] = { date: dateKey, label, total: 0, successful: 0, failed: 0 };
    }

    executions.forEach(e => {
      const dateKey = (e.createdAt || '').slice(0, 10);
      if (daysMap[dateKey]) {
        daysMap[dateKey].total++;
        if (e.status === 'COMPLETED') daysMap[dateKey].successful++;
        else if (e.status === 'FAILED') daysMap[dateKey].failed++;
      }
    });

    const requestsOverTime = Object.values(daysMap);

    // 5. Latency & Workflow Performance
    const totalLatency = executions.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);
    const avgLatencyMs = totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 380;

    const workflowPerformance = workflows.map(wf => ({
      id: wf._id || wf.id,
      name: wf.name,
      status: wf.status,
      totalExecutions: wf.stats?.totalExecutions || 0,
      successRate: (wf.stats?.totalExecutions || 0) > 0
        ? Number((((wf.stats?.successfulExecutions || 0) / (wf.stats?.totalExecutions || 1)) * 100).toFixed(1))
        : 100
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalRequests,
          successfulExecutions,
          failedExecutions,
          successRate,
          mostCommonIntent,
          avgLatencyMs,
          totalWorkflows: workflows.length,
          activeWorkflows: workflows.filter(w => w.status === 'active').length
        },
        intentDistribution,
        priorityDistribution,
        actionDistribution,
        requestsOverTime,
        workflowPerformance
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics
};
