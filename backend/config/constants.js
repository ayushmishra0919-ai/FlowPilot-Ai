/**
 * FlowPilot AI System Constants & Enumerations
 */

const INTENTS = {
  CUSTOMER_SUPPORT: 'customer_support',
  LEAD: 'lead',
  COMPLAINT: 'complaint',
  SALES: 'sales',
  INTERNAL_REQUEST: 'internal_request',
  NOTIFICATION: 'notification',
  GENERAL: 'general'
};

const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const ACTIONS = {
  GMAIL_NOTIFICATION: 'gmail_notification',
  PRIORITY_GMAIL: 'priority_gmail',
  GOOGLE_SHEETS_INSERT: 'google_sheets_insert',
  N8N_TRIGGER: 'n8n_trigger',
  INTERNAL_LOG: 'internal_log',
  WEBHOOK_FORWARD: 'webhook_forward'
};

const WORKFLOW_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  DRAFT: 'draft'
};

const EXECUTION_STATUS = {
  RECEIVED: 'RECEIVED',
  PROCESSING: 'PROCESSING',
  ROUTED: 'ROUTED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

const DEFAULT_SYSTEM_PROMPT = `You are FlowPilot AI, an enterprise-grade intelligent workflow automation processor.
Your task is to analyze incoming business requests, customer messages, or support inquiries, extract all key business entities, classify the intent and urgency/priority, generate a precise single-sentence summary, and recommend the best automated action.

You MUST respond strictly with a valid JSON object adhering precisely to this structure:
{
  "intent": "customer_support" | "lead" | "complaint" | "sales" | "internal_request" | "notification" | "general",
  "priority": "low" | "medium" | "high" | "urgent",
  "summary": "Concise 1-sentence summary of what the user needs or the situation",
  "customer_name": "Extracted person name or 'Unknown'",
  "company": "Extracted company/organization or null",
  "email": "Extracted email address or null",
  "requested_action": "Recommended action identifier (e.g. contact_customer, send_pricing, urgent_refund, log_lead)",
  "category": "Classification category (e.g. delivery_issue, pricing_inquiry, product_defect, enterprise_demo, access_request, billing)",
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "confidence": 0.0 to 1.0 (float reflecting classification confidence)
}

Do NOT wrap the JSON in Markdown code fences if possible, or return only the JSON. Never include commentary, greetings, or explanations outside the JSON object.`;

module.exports = {
  INTENTS,
  PRIORITIES,
  ACTIONS,
  WORKFLOW_STATUS,
  EXECUTION_STATUS,
  DEFAULT_SYSTEM_PROMPT
};
