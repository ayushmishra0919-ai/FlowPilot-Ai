/**
 * FlowPilot AI Execution History Controller
 */

const { Executions } = require('../services/storeAdapter');

// @route GET /api/executions
const getExecutions = async (req, res, next) => {
  try {
    const { status, intent, priority, search, limit = 50, page = 1, workflowId } = req.query;
    let all = await Executions.find({});

    // Filter by status
    if (status && status !== 'ALL') {
      all = all.filter(e => (e.status || '').toUpperCase() === status.toUpperCase());
    }

    // Filter by intent
    if (intent && intent !== 'ALL') {
      all = all.filter(e => e.aiAnalysis?.intent === intent);
    }

    // Filter by priority
    if (priority && priority !== 'ALL') {
      all = all.filter(e => e.aiAnalysis?.priority === priority);
    }

    // Filter by workflowId
    if (workflowId) {
      all = all.filter(e => e.workflowId === workflowId);
    }

    // Search query (matches in message, summary, customer name, execution ID)
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(e =>
        (e._id && e._id.toLowerCase().includes(q)) ||
        (e.input?.message && e.input.message.toLowerCase().includes(q)) ||
        (e.aiAnalysis?.summary && e.aiAnalysis.summary.toLowerCase().includes(q)) ||
        (e.aiAnalysis?.customer_name && e.aiAnalysis.customer_name.toLowerCase().includes(q))
      );
    }

    // Sort by createdAt descending
    all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = all.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = all.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: paginated
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/executions/:id
const getExecutionById = async (req, res, next) => {
  try {
    const execution = await Executions.findById(req.params.id);
    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Execution record not found.'
      });
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/executions
const clearExecutions = async (req, res, next) => {
  try {
    const all = await Executions.find({});
    for (const item of all) {
      await Executions.findByIdAndDelete(item._id || item.id);
    }

    res.json({
      success: true,
      message: 'All execution logs have been reset.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExecutions,
  getExecutionById,
  clearExecutions
};
