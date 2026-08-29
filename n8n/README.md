# FlowPilot AI — n8n Automation Engine Guide

This folder contains the complete, production-ready n8n workflow pipeline for **FlowPilot AI**.

---

## 1. Overview of the n8n Pipeline

The exportable workflow [`n8n/workflows/flowpilot-main-workflow.json`](./workflows/flowpilot-main-workflow.json) implements an enterprise-grade automation sequence:

```
[Webhook Trigger] 
       ↓ 
[Validate Input] 
       ↓ 
[OpenAI GPT Structuring (gpt-4o-mini)] 
       ↓ 
[Parse Structured JSON Schema] 
       ↓ 
[Conditional Router (Switch)]
       ├── [Branch 0: Customer Support] ──→ [Gmail Support Alert]
       ├── [Branch 1: Lead / Sales]      ──→ [Google Sheets Sync]
       ├── [Branch 2: Complaint]         ──→ [Priority Gmail Escalation]
       └── [Branch 3: General/Other]     ──→ [General Archive Logger]
       ↓
[Return Execution Result to Webhook]
```

---

## 2. Prerequisites

1. **n8n Instance**:
   - Local: `npx n8n` (Accessible at `http://localhost:5678`)
   - Docker: `docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n`
   - Cloud: [n8n Cloud](https://n8n.io/cloud/)
2. **API Credentials**:
   - OpenAI API Key (Chat / JSON model)
   - Gmail App Password or Google OAuth2
   - Google Service Account Credentials (for Google Sheets API)

---

## 3. How to Import the Workflow into n8n

1. Launch your n8n instance and navigate to `http://localhost:5678`.
2. In the top-right corner of the Workflows page, click **Add Workflow** (or **+**).
3. Open the **Workflow Menu** (the `...` three dots in top right) and select **Import from File...**.
4. Select `n8n/workflows/flowpilot-main-workflow.json`.
5. The full 10-node automation graph will appear on your canvas.

---

## 4. Node Configuration & Credentials

### Node 1: Webhook Trigger (`Webhook Trigger`)
- **Path**: `flowpilot-inbound`
- **HTTP Method**: `POST`
- **Response Mode**: `When Last Node Finishes` (or `Using 'Respond to Webhook' Node`)
- **Test URL**: `http://localhost:5678/webhook-test/flowpilot-inbound`
- **Production URL**: `http://localhost:5678/webhook/flowpilot-inbound`

### Node 3: OpenAI GPT Structuring (`OpenAI GPT Structuring`)
- Click the node and connect your **OpenAI API Credential**.
- **Model**: `gpt-4o-mini` (or `gpt-4o`)
- **Temperature**: `0.2`

### Node 6: Gmail Support Alert (`Route A - Gmail Support Alert`)
- Connect your **Gmail OAuth2** or **SMTP Credential**.
- Target email: `support@flowpilot.ai`

### Node 7: Google Sheets Sync (`Route B - Google Sheets Sync`)
- Connect your **Google Sheets OAuth2** or **Service Account Credential**.
- **Sheet ID**: Set your Google Spreadsheet ID (or environment variable `{{ $env.GOOGLE_SHEET_ID }}`).
- **Sheet Name**: `Inbound Leads`

---

## 5. Testing the Pipeline via cURL

Send a test inbound payload to the n8n webhook listener:

```bash
curl -X POST http://localhost:5678/webhook-test/flowpilot-inbound \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Rahul from ABC Technologies wants an enterprise product demo. Please notify the sales team.",
    "source": "website_contact_form"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "intent": "lead",
  "priority": "medium",
  "summary": "Rahul from ABC Technologies is requesting an enterprise product demo.",
  "customer_name": "Rahul",
  "company": "ABC Technologies",
  "executionStatus": "completed",
  "action": "google_sheets_insert"
}
```

---

## 6. Zero-Configuration Mode in FlowPilot AI

FlowPilot AI's native Node.js backend includes a built-in webhook dispatcher service in `backend/services/n8nService.js`. When n8n is running, FlowPilot forwards payloads to `N8N_WEBHOOK_URL`. If n8n is offline, FlowPilot automatically logs a demo trace so execution never breaks!
