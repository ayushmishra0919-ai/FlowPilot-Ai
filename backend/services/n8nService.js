/**
 * FlowPilot AI n8n Webhook Integration Service
 * Dispatches structured requests to external n8n automation flows.
 */

async function triggerN8nWebhook({ aiAnalysis, rawInput, route }) {
  const webhookUrl = route.actionParams?.webhookUrl || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/flowpilot-inbound';
  const targetWorkflow = route.actionParams?.targetWorkflow || 'n8n_flowpilot_pipeline';

  const payload = {
    source: 'FlowPilot_AI_Engine',
    workflow: targetWorkflow,
    timestamp: new Date().toISOString(),
    analysis: aiAnalysis,
    input: rawInput,
    route
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlowPilot-AI-Dispatcher/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const responseData = await response.json().catch(() => ({}));

    return {
      status: 'SUCCESS',
      mode: 'LIVE',
      action: 'n8n_trigger',
      webhookUrl,
      targetWorkflow,
      responseStatus: response.status,
      responseData,
      details: `Dispatched payload to live n8n webhook: ${webhookUrl}`
    };
  } catch (error) {
    // If n8n is offline or unreachable, handle cleanly in Demo mode
    return {
      status: 'SUCCESS',
      mode: 'DEMO',
      action: 'n8n_trigger',
      webhookUrl,
      targetWorkflow,
      details: `[Demo Simulation] n8n workflow trigger simulated (${targetWorkflow}). Note: ${error.message}`
    };
  }
}

module.exports = {
  triggerN8nWebhook
};
