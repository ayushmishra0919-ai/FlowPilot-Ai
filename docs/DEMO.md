# FlowPilot AI — Live Demonstration & Evaluation Guide

This document provides a step-by-step walkthrough script for demonstrating **FlowPilot AI** in viva exams, technical interviews, portfolio presentations, or client demos.

---

## 1. Demonstration Scenario 1: Enterprise Lead Ingestion (Core Prompt)

### The Input Request:
> *"Rahul from ABC Technologies wants an enterprise product demo. Please notify the sales team."*

### Demo Steps:
1. Open the **Request Simulator** (`http://localhost:5173/simulator`).
2. Click the **Enterprise Demo Lead** preset chip (or paste the prompt into the textarea).
3. Click **RUN FLOWPILOT AI**.
4. Observe the live animated stepper transitioning through all 6 micro-steps:
   - `[RECEIVED]` Ingestion of unstructured webhook message.
   - `[AI PROCESSING]` OpenAI GPT / Strict JSON Prompt inference.
   - `[ANALYZED]` Entity extraction (`customer_name: "Rahul"`, `company: "ABC Technologies"`, `intent: "lead"`, `priority: "medium"`).
   - `[ROUTED]` Conditional Router evaluates rule `intent == lead` $\rightarrow$ Target Action `google_sheets_insert`.
   - `[ACTION EXECUTED]` Appends row to Google Sheet + dispatches Gmail sales alert.
   - `[COMPLETED]` Microsecond execution receipt saved to database.
5. Open the **Dashboard** (`/dashboard`) and **Analytics** (`/analytics`) to demonstrate that KPI counters, success rates, and volume charts updated dynamically!
6. Open **Settings → Simulated Store Inspector** to show the newly inserted row in the Google Sheets table.

---

## 2. Demonstration Scenario 2: Urgent Delivery Complaint & Support Escalation

### The Input Request:
> *"Customer Rahul has not received his order for 5 days. Please contact him and mark this as urgent."*

### Demo Steps:
1. In the **Request Simulator**, click the **Customer Support** sample chip.
2. Click **RUN FLOWPILOT AI**.
3. Point out:
   - AI extracts `intent: "customer_support"`, `priority: "urgent"`, `category: "delivery_issue"`.
   - Router evaluates priority rules and selects `gmail_notification` with a priority escalation flag.
   - Email template with customer details, order issue summary, and recommended action is formatted.

---

## 3. Demonstration Scenario 3: Broken Product Refund Demand (Complaint)

### The Input Request:
> *"Customer is extremely unhappy because the package arrived broken and damaged. Demanding immediate refund."*

### Demo Steps:
1. Click the **Complaint / Escalation** sample chip.
2. Point out:
   - AI detects negative sentiment and classifies `intent: "complaint"`, `priority: "high"`.
   - Router selects `priority_gmail` with subject `🚨 URGENT CUSTOMER COMPLAINT`.

---

## 4. Demonstration Scenario 4: Visual Workflow Builder

1. Navigate to **Workflows** (`/workflows`) and click **Create Workflow** (`/workflows/new`).
2. Create a new custom pipeline:
   - **Name**: `VIP Enterprise Escalation`
   - **Rule 1**: `IF priority equals urgent THEN priority_gmail`
   - **Rule 2**: `IF intent equals lead THEN google_sheets_insert`
3. Save the workflow and show the generated webhook URL with ready-to-copy `cURL` commands.

---

## 5. Demonstration Scenario 5: Telemetry Logs & Execution Audit Trail

1. Navigate to **Execution History** (`/executions`).
2. Use the filter bar to filter by **Status** (`COMPLETED`/`FAILED`), **Intent** (`lead`/`customer_support`), and **Priority**.
3. Click on any execution row to open the **Execution Detail Modal** showing:
   - Extracted entity cards
   - Validated AI structured JSON
   - Micro-step timeline with duration in milliseconds
   - Action result details with clear live vs demo tagging.
4. Navigate to **Logs** (`/logs`) to show the streaming terminal console.

---

## 6. Demonstration Scenario 6: System Health & Diagnostic Endpoints

1. Open `http://localhost:5000/api/health` in your browser.
2. Demonstrate JSON output displaying uptime, database connection state, active AI engine, and zero secret leaks.
