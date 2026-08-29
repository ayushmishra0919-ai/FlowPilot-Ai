/**
 * FlowPilot AI Webhook Controller
 * Central ingestion pipeline: Receives business requests, invokes AI structuring,
 * routes conditionally, dispatches actions, and logs executions.
 */

const { v4: uuidv4 } = require('uuid');
const { Workflows, Requests, AIAnalyses, Executions } = require('../services/storeAdapter');
const { analyzeRequest } = require('../services/aiService');
const { determineRoute } = require('../services/routerService');
const { sendGmailNotification } = require('../services/gmailService');
const { appendToGoogleSheet } = require('../services/sheetsService');
const { triggerN8nWebhook } = require('../services/n8nService');
const { ACTIONS, EXECUTION_STATUS, WORKFLOW_STATUS } = require('../config/constants');

// @route POST /api/webhook/request
// @route POST /api/requests
const handleWebhookRequest = async (req, res, next) => {
  const overallStartTime = Date.now();
  const timeline = [];

  try {
    // 1. Validate incoming payload
    const { message, text, rawMessage, source = 'webhook', metadata = {} } = req.body;
    const incomingText = message || text || rawMessage;

    if (!incomingText || typeof incomingText !== 'string' || incomingText.trim() === '') {
      return res.status(400).json({
        success: false,
        status: EXECUTION_STATUS.FAILED,
        message: 'Invalid request payload: "message" text field is required.'
      });
    }

    const tReceived = Date.now();
    timeline.push({
      step: 'RECEIVED',
      timestamp: new Date(tReceived).toISOString(),
      status: 'SUCCESS',
      details: `Received inbound request payload from source: ${source}`
    });

    // 2. Identify Target Workflow
    const workflowIdQuery = req.query.workflowId || req.body.workflowId;
    let targetWorkflow = null;

    if (workflowIdQuery) {
      targetWorkflow = await Workflows.findById(workflowIdQuery);
    }

    // If no specific workflow requested or not found, pick the active workflow or default
    if (!targetWorkflow) {
      const activeWorkflows = await Workflows.find({ status: WORKFLOW_STATUS.ACTIVE });
      targetWorkflow = activeWorkflows[0] || (await Workflows.find({}))[0];
    }

    const workflowId = targetWorkflow ? (targetWorkflow._id || targetWorkflow.id) : 'wf-default';
    const userId = targetWorkflow?.userId || req.user?.id || 'user-admin-001';

    // 3. Log incoming request
    const requestId = `req-${uuidv4().substring(0, 8)}`;
    await Requests.create({
      _id: requestId,
      userId,
      workflowId,
      rawMessage: incomingText.trim(),
      source,
      metadata,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    // 4. Send request to AI Engine
    const tAiStart = Date.now();
    timeline.push({
      step: 'AI_PROCESSING',
      timestamp: new Date(tAiStart).toISOString(),
      status: 'SUCCESS',
      details: `Invoking AI Structuring Engine (${targetWorkflow?.configuration?.model || 'gpt-4o-mini'})...`
    });

    const aiResult = await analyzeRequest(
      incomingText.trim(),
      targetWorkflow ? targetWorkflow.configuration : {}
    );
    const tAiEnd = Date.now();

    timeline.push({
      step: 'ANALYZED',
      timestamp: new Date(tAiEnd).toISOString(),
      durationMs: tAiEnd - tAiStart,
      status: aiResult.success ? 'SUCCESS' : 'FAILED',
      details: `Intent: ${aiResult.analysis.intent} | Priority: ${aiResult.analysis.priority} | Entity: ${aiResult.analysis.customer_name} (${aiResult.analysis.company || 'N/A'})`
    });

    // Log AI Analysis
    const analysisId = `ai-${uuidv4().substring(0, 8)}`;
    await AIAnalyses.create({
      _id: analysisId,
      userId,
      workflowId,
      requestId,
      ...aiResult.analysis,
      rawAiResponse: aiResult.rawOutput,
      modelUsed: aiResult.modelUsed
    });

    // 5. Determine Route
    const tRouteStart = Date.now();
    const routeDecision = determineRoute(aiResult.analysis, targetWorkflow || {});
    const tRouteEnd = Date.now();

    timeline.push({
      step: 'ROUTED',
      timestamp: new Date(tRouteStart).toISOString(),
      durationMs: tRouteEnd - tRouteStart,
      status: 'SUCCESS',
      details: `Matched condition [${routeDecision.condition}] -> Target Action [${routeDecision.targetAction}]`
    });

    // 6. Execute Business Action
    const tActionStart = Date.now();
    let actionResult = {};

    switch (routeDecision.targetAction) {
      case ACTIONS.GMAIL_NOTIFICATION:
        actionResult = await sendGmailNotification({
          aiAnalysis: aiResult.analysis,
          route: routeDecision,
          isPriority: false
        });
        break;

      case ACTIONS.PRIORITY_GMAIL:
        actionResult = await sendGmailNotification({
          aiAnalysis: aiResult.analysis,
          route: routeDecision,
          isPriority: true
        });
        break;

      case ACTIONS.GOOGLE_SHEETS_INSERT:
        // 1. Insert into Google Sheet
        const sheetRes = await appendToGoogleSheet({
          aiAnalysis: aiResult.analysis,
          rawInput: { message: incomingText, source },
          route: routeDecision
        });

        // 2. If lead or sales notification requested, also send sales email notification
        let emailRes = null;
        if (routeDecision.actionParams?.notifySales || aiResult.analysis.intent === 'lead' || aiResult.analysis.intent === 'sales') {
          emailRes = await sendGmailNotification({
            aiAnalysis: aiResult.analysis,
            route: routeDecision,
            isPriority: false
          });
        }

        actionResult = {
          ...sheetRes,
          secondaryAction: emailRes ? { action: 'gmail_sales_notification', ...emailRes } : null,
          details: emailRes
            ? `${sheetRes.details} & Sales alert sent.`
            : sheetRes.details
        };
        break;

      case ACTIONS.N8N_TRIGGER:
        actionResult = await triggerN8nWebhook({
          aiAnalysis: aiResult.analysis,
          rawInput: { message: incomingText, source },
          route: routeDecision
        });
        break;

      case ACTIONS.INTERNAL_LOG:
      default:
        actionResult = {
          status: 'SUCCESS',
          mode: 'INTERNAL',
          action: 'internal_log',
          details: `Processed and archived internally with confidence score ${aiResult.analysis.confidence}.`
        };
        break;
    }

    const tActionEnd = Date.now();
    timeline.push({
      step: 'ACTION_EXECUTED',
      timestamp: new Date(tActionStart).toISOString(),
      durationMs: tActionEnd - tActionStart,
      status: actionResult.status || 'SUCCESS',
      details: actionResult.details || `Executed ${routeDecision.targetAction}`
    });

    // 7. Completed Step
    const totalDuration = Date.now() - overallStartTime;
    const executionId = `exec-${uuidv4().substring(0, 8)}`;

    timeline.push({
      step: 'COMPLETED',
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      status: 'SUCCESS',
      details: `Workflow execution finished successfully in ${totalDuration}ms. Receipt ${executionId}`
    });

    const isExecutionFailed = (actionResult.status === 'FAILED' && actionResult.mode === 'LIVE');
    const executionStatus = isExecutionFailed ? EXECUTION_STATUS.FAILED : EXECUTION_STATUS.COMPLETED;

    const isDemo = aiResult.isDemo || actionResult.mode === 'DEMO';

    await Executions.create({
      _id: executionId,
      userId,
      workflowId,
      requestId,
      input: {
        message: incomingText.trim(),
        source,
        timestamp: new Date(tReceived).toISOString(),
        metadata
      },
      aiAnalysis: aiResult.analysis,
      route: routeDecision,
      actionResult,
      status: executionStatus,
      durationMs: totalDuration,
      timeline,
      isDemo
    });

    // Update workflow statistics
    if (targetWorkflow) {
      const stats = targetWorkflow.stats || { totalExecutions: 0, successfulExecutions: 0, failedExecutions: 0 };
      const updates = {
        stats: {
          totalExecutions: (stats.totalExecutions || 0) + 1,
          successfulExecutions: executionStatus === EXECUTION_STATUS.COMPLETED ? (stats.successfulExecutions || 0) + 1 : (stats.successfulExecutions || 0),
          failedExecutions: executionStatus === EXECUTION_STATUS.FAILED ? (stats.failedExecutions || 0) + 1 : (stats.failedExecutions || 0),
          lastExecutedAt: new Date().toISOString()
        }
      };
      await Workflows.findByIdAndUpdate(targetWorkflow._id || targetWorkflow.id, updates);
    }

    // 8. Return formatted response
    return res.status(200).json({
      success: true,
      executionId,
      workflowId,
      intent: aiResult.analysis.intent,
      priority: aiResult.analysis.priority,
      category: aiResult.analysis.category,
      action: routeDecision.targetAction,
      executionStatus,
      durationMs: totalDuration,
      aiAnalysis: aiResult.analysis,
      route: routeDecision,
      actionResult,
      timeline,
      isDemo
    });

  } catch (error) {
    const totalDuration = Date.now() - overallStartTime;
    console.error('❌ [Webhook Handler Error]:', error);

    timeline.push({
      step: 'ACTION_EXECUTED',
      timestamp: new Date().toISOString(),
      status: 'FAILED',
      details: error.message
    });

    const failedExecutionId = `exec-err-${Date.now()}`;
    await Executions.create({
      _id: failedExecutionId,
      userId: req.user?.id || 'user-admin-001',
      workflowId: req.query.workflowId || 'wf-error',
      requestId: `req-err-${Date.now()}`,
      input: {
        message: req.body.message || 'Unknown',
        source: req.body.source || 'webhook',
        timestamp: new Date().toISOString()
      },
      aiAnalysis: {
        intent: 'general',
        priority: 'high',
        summary: 'Execution failed during request processing',
        customer_name: 'Unknown',
        requested_action: 'error_investigation'
      },
      route: {
        targetAction: 'internal_log'
      },
      actionResult: {
        status: 'FAILED',
        error: error.message
      },
      status: EXECUTION_STATUS.FAILED,
      durationMs: totalDuration,
      timeline,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? null : error.stack
      }
    });

    return res.status(500).json({
      success: false,
      executionId: failedExecutionId,
      executionStatus: EXECUTION_STATUS.FAILED,
      message: 'Failed to complete workflow execution.',
      error: error.message,
      timeline
    });
  }
};

module.exports = {
  handleWebhookRequest
};
