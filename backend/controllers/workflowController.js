/**
 * FlowPilot AI Workflow Controller
 */

const { Workflows } = require('../services/storeAdapter');
const { WORKFLOW_STATUS, ACTIONS, INTENTS } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

// @route GET /api/workflows
const getWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflows.find({});
    res.json({
      success: true,
      count: workflows.length,
      data: workflows
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/workflows/:id
const getWorkflowById = async (req, res, next) => {
  try {
    const workflow = await Workflows.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.'
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workflows
const createWorkflow = async (req, res, next) => {
  try {
    const { name, description, configuration } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a workflow name.'
      });
    }

    const workflowId = `wf-${uuidv4().substring(0, 8)}`;
    const webhookUrl = `/api/webhook/request?workflowId=${workflowId}`;

    const newWorkflow = await Workflows.create({
      _id: workflowId,
      userId: req.user?.id || 'user-admin-001',
      name: name.trim(),
      description: description ? description.trim() : '',
      webhookUrl,
      status: WORKFLOW_STATUS.ACTIVE,
      configuration: {
        aiEnabled: configuration?.aiEnabled !== false,
        model: configuration?.model || 'gpt-4o-mini',
        temperature: configuration?.temperature !== undefined ? configuration.temperature : 0.2,
        systemPrompt: configuration?.systemPrompt || '',
        rules: Array.isArray(configuration?.rules) ? configuration.rules : [
          {
            id: `rule-${uuidv4().substring(0, 6)}`,
            conditionField: 'intent',
            conditionOperator: 'equals',
            conditionValue: INTENTS.CUSTOMER_SUPPORT,
            action: ACTIONS.GMAIL_NOTIFICATION,
            actionParams: {
              subject: '[FlowPilot Support] {summary}',
              recipient: 'support@flowpilot.ai'
            }
          }
        ]
      },
      stats: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        lastExecutedAt: null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Workflow created successfully.',
      data: newWorkflow
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/workflows/:id
const updateWorkflow = async (req, res, next) => {
  try {
    const { name, description, configuration, status } = req.body;
    const workflow = await Workflows.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.'
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status;
    if (configuration !== undefined) {
      updates.configuration = {
        ...workflow.configuration,
        ...configuration
      };
    }

    const updated = await Workflows.findByIdAndUpdate(req.params.id, updates);

    res.json({
      success: true,
      message: 'Workflow updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/workflows/:id
const deleteWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflows.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.'
      });
    }

    await Workflows.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Workflow deleted successfully.',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/workflows/:id/status
const toggleWorkflowStatus = async (req, res, next) => {
  try {
    const workflow = await Workflows.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.'
      });
    }

    const newStatus = workflow.status === WORKFLOW_STATUS.ACTIVE ? WORKFLOW_STATUS.PAUSED : WORKFLOW_STATUS.ACTIVE;
    const updated = await Workflows.findByIdAndUpdate(req.params.id, { status: newStatus });

    res.json({
      success: true,
      message: `Workflow status updated to ${newStatus}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflowStatus
};
