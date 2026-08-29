# FlowPilot AI — Setup & Deployment Guide

This guide covers complete local installation, live external credentials setup (OpenAI, Gmail, Google Sheets, n8n, MongoDB), and production deployment options.

---

## 1. Quick Local Setup (Zero-Config Mode)

FlowPilot AI is engineered to run out of the box with zero external dependencies required:

```bash
# 1. Clone or open the repository
cd "FLOW PILOT AI"

# 2. Start both Backend & Frontend concurrently
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Diagnostic Health**: `http://localhost:5000/api/health`
- **Default Admin Account**: `demo@flowpilot.ai` / `password123` (or click **⚡ Instant Demo Login** on the login screen)

---

## 2. Configuring Live External Services (.env)

To upgrade from fallback demo simulation to live production integrations, create/edit your `.env` file in the root directory (or `backend/.env`):

### A. OpenAI GPT API Setup
1. Create an API key on the [OpenAI Platform](https://platform.openai.com/api-keys).
2. Set in `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...your_key_here...
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_TEMPERATURE=0.2
   ```

---

### B. Gmail SMTP Dispatch Setup
To enable real email dispatch via Gmail:
1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification**.
3. Go to **App Passwords** (`https://myaccount.google.com/apppasswords`) and generate an App Password for "FlowPilot Mail".
4. Set in `.env`:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM_NAME="FlowPilot AI Automation"
   EMAIL_DEFAULT_RECIPIENT=support@company.com
   ```

---

### C. Google Sheets API Setup
To automatically append customer leads to a Google Sheet:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Sheets API**.
3. Create a **Service Account**, generate a JSON key, and note the service account email.
4. Create a Google Spreadsheet, rename Tab 1 to `Inbound Leads 2026`, and **Share** edit access with your service account email.
5. Set in `.env`:
   ```env
   GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   GOOGLE_SERVICE_ACCOUNT_EMAIL=flowpilot-service@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----\n"
   ```

---

### D. n8n Automation Engine Setup
1. Launch n8n:
   ```bash
   npx n8n
   ```
2. Open `http://localhost:5678`, import `n8n/workflows/flowpilot-main-workflow.json`.
3. Set in `.env`:
   ```env
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/flowpilot-inbound
   ```

---

### E. MongoDB Database Setup (Optional)
By default, FlowPilot uses its high-speed embedded persistent store in `backend/data/db.json`. To connect to a live MongoDB instance:
```env
MONGODB_URI=mongodb://localhost:27017/flowpilot_ai
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/flowpilot?retryWrites=true&w=majority
```

---

## 3. Verifying All Integrations

You can verify and test the connectivity of all integrations directly from the **Settings** page:
1. Navigate to `http://localhost:5173/settings`.
2. Click **Integration Connections**.
3. Click **Test OpenAI Connection**, **Test Gmail SMTP Connection**, **Test Google Sheets API**, and **Test n8n Webhook Listener**.
4. Live status badges will verify active credentials.
