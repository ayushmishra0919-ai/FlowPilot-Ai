/**
 * FlowPilot AI Conditional Routing Engine
 * Evaluates structured AI outputs against user-configured workflow rules
 * to determine target business actions.
 */

const { INTENTS, PRIORITIES, ACTIONS } = require('../config/constants');

/**
 * Evaluate a single conditional rule against AI analysis payload
 */
function evaluateRule(rule, aiAnalysis) {
  const { conditionField, conditionOperator, conditionValue } = rule;
  const actualValue = (aiAnalysis[conditionField] || '').toString().toLowerCase();
  const targetValue = (conditionValue || '').toString().toLowerCase();

  switch (conditionOperator) {
    case 'equals':
      return actualValue === targetValue;
    case 'not_equals':
      return actualValue !== targetValue;
    case 'contains':
      return actualValue.includes(targetValue);
    case 'in':
      const list = targetValue.split(',').map(s => s.trim().toLowerCase());
      return list.includes(actualValue);
    default:
      return actualValue === targetValue;
  }
}

/**
 * Determine the route for an incoming AI analysis
 * @param {object} aiAnalysis - Structured AI analysis object
 * @param {object} workflow - Workflow configuration with rules
 */
function determineRoute(aiAnalysis, workflow = {}) {
  const rules = workflow.configuration?.rules || [];

  // 1. Evaluate user-defined rules in priority order
  for (const rule of rules) {
    if (evaluateRule(rule, aiAnalysis)) {
      return {
        matchedRuleId: rule.id || 'rule-matched',
        condition: `${rule.conditionField} ${rule.conditionOperator} ${rule.conditionValue}`,
        targetAction: rule.action,
        actionParams: rule.actionParams || {},
        isDefaultFallback: false
      };
    }
  }

  // 2. Intelligent Default Routing Strategy based on Intent and Priority
  let defaultAction = ACTIONS.INTERNAL_LOG;
  let actionParams = {};

  if (aiAnalysis.priority === PRIORITIES.URGENT || aiAnalysis.intent === INTENTS.COMPLAINT) {
    defaultAction = ACTIONS.PRIORITY_GMAIL;
    actionParams = {
      subject: `🚨 [FlowPilot Priority Escalation] ${aiAnalysis.summary}`,
      recipient: 'escalations@flowpilot.ai'
    };
  } else if (aiAnalysis.intent === INTENTS.LEAD || aiAnalysis.intent === INTENTS.SALES) {
    defaultAction = ACTIONS.GOOGLE_SHEETS_INSERT;
    actionParams = {
      sheetName: 'Inbound Leads CRM',
      notifySales: true,
      salesRecipient: 'sales@flowpilot.ai',
      salesSubject: `[FlowPilot AI] New Sales Lead: ${aiAnalysis.customer_name || 'Prospect'} (${aiAnalysis.company || 'Direct'})`
    };
  } else if (aiAnalysis.intent === INTENTS.CUSTOMER_SUPPORT) {
    defaultAction = ACTIONS.GMAIL_NOTIFICATION;
    actionParams = {
      subject: `[FlowPilot Support] Customer Inquiry - ${aiAnalysis.customer_name || 'Customer'}`,
      recipient: 'support@flowpilot.ai'
    };
  } else if (aiAnalysis.intent === INTENTS.INTERNAL_REQUEST) {
    defaultAction = ACTIONS.N8N_TRIGGER;
    actionParams = {
      targetWorkflow: 'n8n_flowpilot_pipeline'
    };
  }

  return {
    matchedRuleId: 'system-default-rule',
    condition: `intent == ${aiAnalysis.intent} (Default Route)`,
    targetAction: defaultAction,
    actionParams,
    isDefaultFallback: true
  };
}

module.exports = {
  determineRoute,
  evaluateRule
};
