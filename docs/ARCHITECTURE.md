# FlowPilot AI — System Architecture & Design Document

## 1. Executive Summary

FlowPilot AI is engineered to automate business workflows that originate as unstructured text (customer complaints, enterprise sales leads, tech support issues, server alerts). The system utilizes Large Language Models (OpenAI GPT-4o-mini) paired with strict JSON schema parsing and conditional switch routing to automate execution across email, CRM, and webhook platforms.

---

## 2. Component Pipeline

```mermaid
flowchart TD
    subgraph Ingestion ["1. INGESTION LAYER"]
        A1[Client Request Simulator] --> B1[/api/webhook/request]
        A2[Third-Party Webhooks] --> B1
        A3[Public Inbound API] --> B1
    end

    subgraph Intelligence ["2. AI & ENTITY STRUCTURING"]
        B1 --> C1[Input Validation]
        C1 --> C2[OpenAI GPT Engine / Strict Schema Prompt]
        C2 --> C3[Schema Sanitizer & Entity Normalizer]
        C3 -->|Fallback Mode| C4[Heuristic NLP Extractor]
    end

    subgraph Routing ["3. CONDITIONAL ROUTING ENGINE"]
        C3 --> D1{Rule Evaluation Engine}
        D1 -->|Intent == support| E1[Gmail Support Dispatcher]
        D1 -->|Intent == lead| E2[Google Sheets CRM Sync]
        D1 -->|Priority == urgent| E3[Priority Escalation Alert]
        D1 -->|Intent == internal| E4[n8n Automation Engine]
        D1 -->|Default Fallback| E5[Internal Telemetry Archive]
    end

    subgraph ActionExecution ["4. ACTION & DISPATCH LAYER"]
        E1 --> F1[Nodemailer SMTP / In-App Mailbox]
        E2 --> F2[Google Sheets API / Simulated Table]
        E3 --> F3[High-Priority HTML Alert]
        E4 --> F4[n8n Webhook Forwarder]
    end

    subgraph Telemetry ["5. TELEMETRY & PERSISTENCE"]
        F1 & F2 & F3 & F4 & E5 --> G1[Store Adapter - MongoDB / Embedded JSON]
        G1 --> G2[RequestLog]
        G1 --> G3[AIAnalysis]
        G1 --> G4[Execution with Micro-Step Timelines]
        G1 --> G5[Workflow Execution Stats]
    end

    subgraph Observability ["6. OBSERVABILITY & UI"]
        G1 --> H1[React Dashboard]
        G1 --> H2[Live Execution Stepper]
        G1 --> H3[Recharts Analytics]
        G1 --> H4[Streaming Telemetry Logs]
    end
```

---

## 3. Storage Model & Zero-Config Persistence

The platform incorporates a dual-mode persistence architecture managed by `backend/services/storeAdapter.js`:

1. **MongoDB / Mongoose**: If `MONGODB_URI` is present and reachable, Mongoose manages document persistence.
2. **Embedded JSON Store (`data/db.json`)**: If MongoDB is offline, the backend seamlessly activates an atomic file-backed JSON store with memory caching. This ensures zero setup friction during development or evaluation.

### Schemas:
- `User`: Authentication credentials, password hash (bcrypt), role.
- `Workflow`: Workflow metadata, AI config, conditional rules, execution counters.
- `RequestLog`: Raw incoming payloads, source identifiers, IP addresses.
- `AIAnalysis`: Intent, priority, summary, customer name, company, email, category, sentiment, confidence.
- `Execution`: Full trace record with microsecond step timelines (`WEBHOOK_RECEIVED`, `AI_STRUCTURING`, `CONDITIONAL_ROUTING`, `ACTION_EXECUTION`, `LOG_RECORDED`).

---

## 4. Conditional Routing Logic

Rules are evaluated sequentially. A rule is represented as:

$$\text{Rule} = \{ \text{conditionField}, \text{conditionOperator}, \text{conditionValue}, \text{action}, \text{actionParams} \}$$

Supported operators:
- `equals` ($=$)
- `not_equals` ($\neq$)
- `contains`
- `in` (comma-separated list)

If no custom rule matches the extracted payload, FlowPilot applies intent-based default routing:
- `customer_support` $\rightarrow$ `gmail_notification`
- `lead` / `sales` $\rightarrow$ `google_sheets_insert`
- `complaint` / `urgent` $\rightarrow$ `priority_gmail`
- `internal_request` $\rightarrow$ `n8n_trigger`
- `general` $\rightarrow$ `internal_log`
