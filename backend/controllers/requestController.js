/**
 * FlowPilot AI Requests Controller
 */

const { Requests, AIAnalyses } = require('../services/storeAdapter');

// @route GET /api/requests
const getRequests = async (req, res, next) => {
  try {
    const { workflowId, limit = 50 } = req.query;
    let requests = await Requests.find({});

    if (workflowId) {
      requests = requests.filter(r => r.workflowId === workflowId);
    }

    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    requests = requests.slice(0, Number(limit));

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests
};
