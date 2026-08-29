# FlowPilot AI — REST API Reference

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Register User
`POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Alex Vance",
  "email": "alex@flowpilot.ai",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "user-admin-001",
    "name": "Alex Vance",
    "email": "alex@flowpilot.ai",
    "role": "admin"
  }
}
```

---

### Login User
`POST /api/auth/login`

**Request Body:**
```json
{
  "email": "demo@flowpilot.ai",
  "password": "password123"
}
```

---

### Get Authenticated User Profile
`GET /api/auth/me`  
*Header: `Authorization: Bearer <token>`*

---

## 2. Inbound Webhook Endpoint

### Ingest Business Request
`POST /api/webhook/request` or `POST /api/webhook/request?workflowId=<workflowId>`

**Request Body:**
```json
{
  "message": "Customer Rahul has not received his order for 5 days. Please contact him and mark this as urgent.",
  "source": "website_chat_widget",
  "metadata": {
    "ip": "192.168.1.1"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "executionId": "exec-9f82b14c",
  "workflowId": "wf-support-001",
  "intent": "customer_support",
  "priority": "high",
  "category": "delivery_issue",
  "action": "gmail_notification",
  "executionStatus": "COMPLETED",
  "durationMs": 382,
  "aiAnalysis": {
    "intent": "customer_support",
    "priority": "high",
    "summary": "Customer Rahul has not received order for 5 days.",
    "customer_name": "Rahul",
    "company": null,
    "email": "rahul@gmail.com",
    "requested_action": "contact_customer",
    "category": "delivery_issue",
    "sentiment": "urgent",
    "confidence": 0.96
  },
  "route": {
    "matchedRuleId": "rule-1",
    "condition": "intent == customer_support",
    "targetAction": "gmail_notification"
  },
  "actionResult": {
    "status": "SUCCESS",
    "mode": "DEMO",
    "action": "gmail_notification",
    "details": "Email simulation generated and logged in FlowPilot Mailbox."
  },
  "timeline": [
    { "step": "WEBHOOK_RECEIVED", "timestamp": "...", "status": "SUCCESS" },
    { "step": "AI_STRUCTURING", "timestamp": "...", "durationMs": 210, "status": "SUCCESS" },
    { "step": "CONDITIONAL_ROUTING", "timestamp": "...", "durationMs": 10, "status": "SUCCESS" },
    { "step": "ACTION_EXECUTION", "timestamp": "...", "durationMs": 150, "status": "SUCCESS" },
    { "step": "LOG_RECORDED", "timestamp": "...", "durationMs": 12, "status": "SUCCESS" }
  ]
}
```

---

## 3. Workflows Endpoints

- `GET /api/workflows` — List all workflows
- `POST /api/workflows` — Create workflow
- `GET /api/workflows/:id` — Get workflow by ID
- `PUT /api/workflows/:id` — Update workflow
- `DELETE /api/workflows/:id` — Delete workflow
- `PATCH /api/workflows/:id/status` — Toggle active / paused

---

## 4. Execution & Telemetry Endpoints

- `GET /api/executions?page=1&limit=10&status=COMPLETED&intent=lead` — Query execution history with filtering
- `GET /api/executions/:id` — Get complete execution drilldown with timeline and raw payloads
- `DELETE /api/executions` — Reset/clear execution history

---

## 5. Analytics & Diagnostics Endpoints

- `GET /api/analytics` — Fetch aggregated metrics, intent distribution, and daily volumes
- `GET /api/health` — Platform health, database state, uptime, and AI engine status
- `GET /api/settings` — Get integration configuration statuses
- `POST /api/settings/test-integration` — Run diagnostics test for OpenAI, Gmail, Google Sheets, or n8n
