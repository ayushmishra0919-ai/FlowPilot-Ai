# FlowPilot AI — Intelligent Workflow Automation Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68a063?style=flat&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat&logo=openai)](https://openai.com/)
[![n8n](https://img.shields.io/badge/n8n-Integration-ff6d5a?style=flat&logo=n8n)](https://n8n.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)

> **FlowPilot AI** is a production-style intelligent workflow automation platform that ingests unstructured business requests via webhooks, uses OpenAI GPT to structure data, applies conditional routing, and executes target actions across **Gmail**, **Google Sheets**, and **n8n**, complete with live telemetry, analytics, and an interactive Request Simulator.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution & Core Workflow](#3-solution--core-workflow)
4. [Key Features](#4-key-features)
5. [System Architecture](#5-system-architecture)
6. [Tech Stack](#6-tech-stack)
7. [Installation & Quick Start](#7-installation--quick-start)
8. [Environment Variables](#8-environment-variables)
9. [Running the Application](#9-running-the-application)
10. [OpenAI GPT Structuring & Prompt Design](#10-openai-gpt-structuring--prompt-design)
11. [Gmail & Email Integration](#11-gmail--email-integration)
12. [Google Sheets Integration](#12-google-sheets-integration)
13. [n8n Automation Pipeline](#13-n8n-automation-pipeline)
14. [Request Simulator & Live Demo](#14-request-simulator--live-demo)
15. [Zero-Break Demo Mode](#15-zero-break-demo-mode)
16. [REST API Reference](#16-rest-api-reference)
17. [Automated Testing](#17-automated-testing)
18. [Future Scope](#18-future-scope)

---

## 1. Overview

Modern enterprises receive hundreds of unstructured communications daily through contact forms, emails, support chat widgets, and incident webhooks. Manually reading, classifying, prioritizing, and copying data between CRM spreadsheets and alerting channels causes costly delays and human error.

**FlowPilot AI** solves this by converting raw natural language requests into structured, validated JSON data in milliseconds, making automated business routing decisions, and dispatching targeted actions seamlessly.

---

## 2. Problem Statement

- **Unstructured Influx**: Customer and operational requests arrive as chaotic free-text.
- **Fragmented Systems**: Support agents manually copy lead data to Google Sheets and send email alerts.
- **Slow Response Times**: Urgent issues (e.g. delivery failures, down servers) wait in general queues.
- **Fragile AI Integration**: Traditional LLM prompts without schema enforcement frequently fail downstream integrations.

---

## 3. Solution & Core Workflow

```mermaid
flowchart LR
    A[Inbound Business Request] --> B[Webhook Ingestion /api/webhook/request]
    B --> C[OpenAI GPT Analysis]
    C --> D[Strict JSON Validation & Entity Extraction]
    D --> E{Conditional Switch Router}
    E -->|Customer Support| F[Gmail Support Alert]
    E -->|Lead / Sales| G[Google Sheets CRM Sync]
    E -->|Complaint / Urgent| H[Priority Escalation Email]
    E -->|Internal / DevOps| I[n8n Automation Trigger]
    F & G & H & I --> J[Telemetry Database]
    J --> K[Live SaaS Dashboard & Analytics]
```

### Supported Classification Enums
- **Intents**: `customer_support`, `lead`, `complaint`, `sales`, `internal_request`, `notification`, `general`
- **Priorities**: `low`, `medium`, `high`, `urgent`

---

## 4. Key Features

- **AI Structuring & Entity Extraction**: Extracts customer names, company names, email addresses, intent classification, priority urgency, sentiment, concise summaries, and recommended actions with strict JSON schema validation.
- **Zero-Config Database**: Seamlessly switches between MongoDB and a high-speed embedded persistent JSON database (`data/db.json`) if MongoDB is not locally running.
- **Interactive Request Simulator**: Test live business requests with 1-click sample presets, animated step-by-step pipeline progression, execution latency counters, and structured JSON inspectors.
- **Visual Workflow Builder**: Create custom workflows with dynamic conditional rules (`IF intent == lead THEN google_sheets_insert`, `IF priority == urgent THEN priority_gmail`).
- **Gmail Automation**: Generates responsive, branded HTML email templates for support desks with priority escalation tags.
- **Google Sheets Synchronization**: Appends structured customer rows to live Google Sheets or the built-in simulated CRM spreadsheet.
- **n8n Automation Export**: Includes a ready-to-import n8n workflow (`n8n/workflows/flowpilot_automation.json`) for multi-node enterprise pipelines.
- **Real-Time Telemetry & Logs**: Micro-step duration audits (`WEBHOOK_RECEIVED`, `AI_STRUCTURING`, `CONDITIONAL_ROUTING`, `ACTION_EXECUTION`, `LOG_RECORDED`).
- **Comprehensive Analytics**: Interactive charts using Recharts for daily request volumes, intent breakdown, priority distributions, and latency tracking.

---

## 5. System Architecture

```
flowpilot-ai/
├── package.json               # Root scripts (dev, test, start)
├── .env.example               # Root configuration template
├── README.md                  # Comprehensive platform documentation
├── backend/
│   ├── package.json
│   ├── server.js              # Express REST & Webhook server
│   ├── config/
│   │   ├── db.js              # Database connection manager (Mongo + Embedded)
│   │   └── constants.js       # Intents, priorities, system prompts
│   ├── controllers/           # Auth, workflows, webhooks, executions, analytics, settings
│   ├── models/                # User, Workflow, RequestLog, AIAnalysis, Execution
│   ├── services/
│   │   ├── aiService.js       # OpenAI GPT + NLP fallback engine
│   │   ├── routerService.js   # Multi-branch conditional router
│   │   ├── gmailService.js    # Gmail SMTP & simulated mailbox
│   │   ├── sheetsService.js   # Google Sheets API & simulated table
│   │   ├── n8nService.js      # n8n webhook dispatcher
│   │   └── storeAdapter.js    # Unified persistence layer
│   └── tests/
│       └── api.test.js        # Automated API & verification suite
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx            # Main router & layout
│       ├── context/           # AuthContext & ToastContext
│       ├── services/          # Axios API client
│       ├── components/        # Navbar, Sidebar, Flowchart, Stepper, JsonViewer, Modals
│       └── pages/             # Landing, Dashboard, Simulator, Workflows, History, Analytics, Logs, Settings
├── 📁 n8n/
│   ├── 📄 README.md                  # Comprehensive n8n setup & node guide
│   └── 📁 workflows/
│       ├── 📄 flowpilot-main-workflow.json  # Importable main n8n workflow
│       └── 📄 flowpilot_automation.json     # Pipeline definition
└── 📁 docs/
    ├── 📄 ARCHITECTURE.md            # System architecture & data flow diagrams
    ├── 📄 API_REFERENCE.md           # Full REST & Webhook API documentation
    ├── 📄 SETUP.md                   # Environment & integrations setup guide
    └── 📄 DEMO.md                    # Live viva/presentation demonstration guide
```

---

## 6. Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide React, Recharts, React Router Dom v6, Axios.
- **Backend**: Node.js v20+, Express.js 4, Mongoose 8 / Embedded Store, JWT, bcryptjs, Nodemailer, Google APIs.
- **AI / LLM**: OpenAI GPT (`gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`) with structured JSON schema verification & intelligent NLP fallback.
- **Automation**: n8n Webhook Trigger, Switch Router, Function Nodes.

---

## 7. Installation & Quick Start

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 1. Clone & Install All Dependencies
```bash
# In project root
npm run install:all
```

---

## 8. Environment Variables

Create a `.env` file in the root directory or `backend/.env` using the provided `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Security
JWT_SECRET=flowpilot_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d

# Database (Optional - uses embedded data/db.json if not configured)
MONGODB_URI=mongodb://localhost:27017/flowpilot_ai

# OpenAI GPT Integration (Optional - intelligent NLP fallback active in Demo mode)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.2

# Gmail Integration (Optional)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
EMAIL_FROM_NAME="FlowPilot AI Automation"
EMAIL_DEFAULT_RECIPIENT=support@company.com

# Google Sheets Integration (Optional)
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# n8n Automation (Optional)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/flowpilot-inbound

# Demo Mode
DEMO_MODE=true
```

---

## 9. Running the Application

### Start Both Frontend and Backend Concurrently
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### Demo Credentials
- **Email**: `demo@flowpilot.ai`
- **Password**: `password123`
- *(Or click **⚡ Instant Demo Login** on the login page)*

---

## 10. OpenAI GPT Structuring & Prompt Design

FlowPilot AI instructs the OpenAI model to produce strictly validated JSON:

```json
{
  "intent": "customer_support",
  "priority": "high",
  "summary": "Customer Rahul has not received his order for 5 days.",
  "customer_name": "Rahul",
  "company": null,
  "email": "rahul@gmail.com",
  "requested_action": "contact_customer",
  "category": "delivery_issue",
  "sentiment": "urgent",
  "confidence": 0.96
}
```

If the OpenAI API key is not present or an API outage occurs, FlowPilot's built-in intelligent NLP extractor parses entities, detects urgency and intent, and formats the same strict schema automatically.

---

## 11. Gmail & Email Integration

When a workflow routes to `gmail_notification` or `priority_gmail`:
- If Gmail credentials (`GMAIL_USER` and `GMAIL_APP_PASSWORD`) are present, an email is dispatched via Nodemailer.
- In Demo mode, a responsive HTML email is generated and recorded in the in-app **Simulated Sent Mailbox** under **Settings → Simulated Store Inspector**.

---

## 12. Google Sheets Integration

When a workflow routes to `google_sheets_insert`:
- If Google credentials are provided, rows are appended via the Google Sheets API (`googleapis`).
- In Demo mode, records are appended to the in-app **Simulated Google Sheet CRM** table with timestamps, customer names, companies, intents, priorities, and summaries.

---

## 13. n8n Automation Pipeline

Import `n8n/workflows/flowpilot_automation.json` directly into your n8n workspace:
1. Open n8n at `http://localhost:5678`.
2. Select **Workflows → Import from File...**.
3. Choose `n8n/workflows/flowpilot_automation.json`.
4. Connect credentials for OpenAI, Gmail, and Google Sheets.
5. Click **Activate**.

---

## 14. Request Simulator & Live Demo

1. Open `http://localhost:5173/simulator`.
2. Select one of the pre-configured sample requests:
   - **Customer Support**: *"Customer Rahul has not received his order for 5 days. Please contact him and mark this as urgent."*
   - **Sales Lead**: *"Priya from XYZ company wants pricing information and an enterprise demo for 200 seats."*
   - **Complaint**: *"Customer is extremely unhappy because the package arrived broken and damaged."*
3. Click **Run FlowPilot AI**.
4. Observe the live animated stepper:
   - `[Step 1]` Webhook Ingested
   - `[Step 2]` AI Structuring & Schema Validation
   - `[Step 3]` Conditional Router Switch
   - `[Step 4]` Action Executed (Gmail / Google Sheets / n8n)
   - `[Step 5]` Saved to Telemetry DB
5. Inspect the extracted entities and structured JSON output.

---

## 15. Zero-Break Demo Mode

FlowPilot AI includes a transparent **Demo Mode**:
- Simulated dispatches are clearly labeled as `[DEMO EXECUTION]` vs `[LIVE EXECUTION]`.
- No mock credentials are fake-claimed; all simulated emails and spreadsheet rows are viewable in the UI.

---

## 16. REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes |
| `GET` | `/api/workflows` | List all workflows | No |
| `POST` | `/api/workflows` | Create a new workflow | Yes |
| `GET` | `/api/workflows/:id` | Get workflow details | No |
| `PUT` | `/api/workflows/:id` | Update workflow | Yes |
| `DELETE`| `/api/workflows/:id` | Delete workflow | Yes |
| `PATCH`| `/api/workflows/:id/status`| Toggle active/paused | Yes |
| `POST` | `/api/webhook/request` | Universal inbound webhook | No |
| `GET` | `/api/executions` | List executions with filters | No |
| `GET` | `/api/executions/:id` | Get single execution details | No |
| `GET` | `/api/analytics` | Aggregate metrics & charts | No |
| `GET` | `/api/settings` | Get configuration status | No |
| `PUT` | `/api/settings` | Update AI & demo settings | Yes |
| `POST` | `/api/settings/test-integration`| Test integration connectivity | Yes |
| `GET` | `/api/health` | System health check | No |

---

## 17. Automated Testing

Run the automated backend test suite:

```bash
npm test
```

Verifies:
- AI Structuring & Entity Extraction
- Conditional Routing Logic
- Health & System Diagnostics
- Authentication Flow (Login, Register, JWT)
- End-to-End Inbound Webhook Execution Pipeline
- Execution Telemetry & Analytics Aggregation
- Workflows CRUD Operations

---

## 18. Future Scope

- Multi-tenant team roles and workspace RBAC.
- Webhook signature verification (HMAC SHA-256).
- Direct Slack and Microsoft Teams bot dispatchers.
- Visual drag-and-drop canvas workflow builder.

---

**FlowPilot AI** — Built for high-reliability, intelligent business automation.
