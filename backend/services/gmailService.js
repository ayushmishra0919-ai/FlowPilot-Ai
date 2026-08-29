/**
 * FlowPilot AI Gmail Automation Service
 * Handles email generation, HTML formatting, live SMTP dispatch, and Demo simulation.
 */

const nodemailer = require('nodemailer');
const { MockGmailInbox } = require('./storeAdapter');

/**
 * Build rich HTML email template
 */
function buildEmailTemplate(aiAnalysis, subject, isPriority = false) {
  const priorityColor = isPriority || aiAnalysis.priority === 'urgent' ? '#ef4444' : (aiAnalysis.priority === 'high' ? '#f97316' : '#3b82f6');
  const badgeText = isPriority ? 'CRITICAL ESCALATION' : aiAnalysis.priority.toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 24px; text-align: left; border-bottom: 2px solid ${priorityColor}; }
    .header h1 { margin: 0; font-size: 20px; color: #ffffff; font-weight: 700; }
    .badge { display: inline-block; background-color: ${priorityColor}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-top: 8px; }
    .content { padding: 24px; }
    .card { background: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #334155; }
    .field-label { font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #f1f5f9; font-weight: 500; }
    .action-box { background: #172554; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 4px; margin-top: 16px; }
    .footer { padding: 16px 24px; background: #0f172a; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ FlowPilot AI — Automated Request Notification</h1>
      <span class="badge">${badgeText}</span>
    </div>
    <div class="content">
      <p style="margin-top:0; color:#cbd5e1; font-size: 14px;">An incoming business request was processed by FlowPilot AI and automatically routed for your attention:</p>
      
      <div class="card">
        <div class="field-label">Customer / Requestor</div>
        <div class="field-value">${aiAnalysis.customer_name || 'Unknown'} ${aiAnalysis.company ? `(${aiAnalysis.company})` : ''}</div>
      </div>

      ${aiAnalysis.company ? `
      <div class="card">
        <div class="field-label">Company</div>
        <div class="field-value">${aiAnalysis.company}</div>
      </div>
      ` : ''}

      <div class="card">
        <div class="field-label">AI Summary</div>
        <div class="field-value">${aiAnalysis.summary}</div>
      </div>

      <div style="display: flex; gap: 12px;">
        <div class="card" style="flex: 1;">
          <div class="field-label">Intent</div>
          <div class="field-value" style="color: #60a5fa; text-transform: capitalize;">${(aiAnalysis.intent || '').replace('_', ' ')}</div>
        </div>
        <div class="card" style="flex: 1;">
          <div class="field-label">Priority</div>
          <div class="field-value" style="color: ${priorityColor}; text-transform: uppercase; font-weight: bold;">${aiAnalysis.priority || 'medium'}</div>
        </div>
      </div>

      <div class="action-box">
        <div class="field-label" style="color: #93c5fd;">Recommended Action</div>
        <div class="field-value" style="color: #ffffff; font-weight: 600;">${(aiAnalysis.requested_action || 'review_and_respond').replace(/_/g, ' ').toUpperCase()}</div>
      </div>
    </div>
    <div class="footer">
      Generated automatically by FlowPilot AI Workflow Automation Platform.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send or simulate Gmail notification
 */
async function sendGmailNotification({ aiAnalysis, route = {}, isPriority = false, overrideSubject = null, overrideRecipient = null }) {
  let defaultSubject = '[FlowPilot AI] Notification';
  if (aiAnalysis.intent === 'lead' || aiAnalysis.intent === 'sales') {
    defaultSubject = `[FlowPilot AI] New Sales Lead: ${aiAnalysis.customer_name || 'Prospect'}${aiAnalysis.company ? ' from ' + aiAnalysis.company : ''}`;
  } else if (aiAnalysis.intent === 'complaint' || isPriority) {
    defaultSubject = `🚨 [FlowPilot AI] Priority Escalation: ${aiAnalysis.summary}`;
  } else if (aiAnalysis.intent === 'customer_support') {
    defaultSubject = `[FlowPilot Support] Customer Inquiry - ${aiAnalysis.customer_name || 'Customer'}`;
  }

  const recipient = overrideRecipient || route.actionParams?.recipient || route.actionParams?.salesRecipient || process.env.EMAIL_DEFAULT_RECIPIENT || 'support@flowpilot.ai';
  let subject = overrideSubject || route.actionParams?.subject || route.actionParams?.salesSubject || defaultSubject;

  // Replace placeholders in subject
  subject = subject
    .replace('{customer_name}', aiAnalysis.customer_name || 'Customer')
    .replace('{company}', aiAnalysis.company || '')
    .replace('{summary}', aiAnalysis.summary || '')
    .replace('{category}', aiAnalysis.category || 'General');

  const htmlContent = buildEmailTemplate(aiAnalysis, subject, isPriority);

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const isDemoMode = process.env.DEMO_MODE !== 'false' || !gmailUser || !gmailPassword;

  // Demo Mode or Missing Credentials: Store into Mock Inbox
  if (isDemoMode) {
    const demoEmail = {
      recipient,
      sender: `FlowPilot AI Automation <${gmailUser || 'automation@flowpilot.ai'}>`,
      subject,
      html: htmlContent,
      text: `Customer: ${aiAnalysis.customer_name || 'Unknown'}\nCompany: ${aiAnalysis.company || 'N/A'}\nIntent: ${aiAnalysis.intent}\nPriority: ${aiAnalysis.priority}\nSummary: ${aiAnalysis.summary}\nRecommended Action: ${aiAnalysis.requested_action}`,
      timestamp: new Date().toISOString(),
      isPriority,
      mode: 'DEMO'
    };

    await MockGmailInbox.create(demoEmail);

    return {
      status: 'SUCCESS',
      mode: 'DEMO',
      action: isPriority ? 'priority_gmail' : 'gmail_notification',
      recipient,
      subject,
      messageId: `demo-msg-${Date.now()}`,
      details: `[DEMO MODE] Email recorded in FlowPilot Simulated Mailbox for ${recipient}. Live Gmail SMTP credentials not configured in .env.`
    };
  }

  // Live Mode: Nodemailer SMTP
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'FlowPilot AI'}" <${gmailUser}>`,
      to: recipient,
      subject,
      text: `Customer: ${aiAnalysis.customer_name || 'Unknown'}\nCompany: ${aiAnalysis.company || 'N/A'}\nIntent: ${aiAnalysis.intent}\nPriority: ${aiAnalysis.priority}\nSummary: ${aiAnalysis.summary}\nRecommended Action: ${aiAnalysis.requested_action}`,
      html: htmlContent
    });

    return {
      status: 'SUCCESS',
      mode: 'LIVE',
      action: isPriority ? 'priority_gmail' : 'gmail_notification',
      recipient,
      subject,
      messageId: info.messageId,
      details: `[LIVE EXECUTION] Dispatched real email via Gmail SMTP to ${recipient}.`
    };
  } catch (error) {
    console.error('❌ [Gmail Service] Error sending live email:', error.message);
    return {
      status: 'FAILED',
      mode: 'LIVE',
      action: isPriority ? 'priority_gmail' : 'gmail_notification',
      recipient,
      subject,
      error: error.message,
      details: `Live Gmail SMTP dispatch failed: ${error.message}`
    };
  }
}

module.exports = {
  sendGmailNotification,
  buildEmailTemplate
};
