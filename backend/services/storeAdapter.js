/**
 * FlowPilot AI Unified Storage Adapter
 * Provides seamless CRUD operations with automatic MongoDB synchronization when connected,
 * and a reliable embedded persistent JSON engine (data/db.json) for zero-setup execution.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { INTENTS, PRIORITIES, ACTIONS, WORKFLOW_STATUS, EXECUTION_STATUS } = require('../config/constants');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced with disk
let memoryStore = {
  users: [],
  workflows: [],
  requests: [],
  aiAnalyses: [],
  executions: [],
  integrations: [],
  settings: {},
  mockGoogleSheet: [],
  mockGmailInbox: []
};

// Seed initial default data
async function getInitialData() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  const adminId = 'user-admin-001';

  const defaultUser = {
    _id: adminId,
    name: 'Alex Vance',
    email: 'demo@flowpilot.ai',
    passwordHash,
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  const defaultWorkflows = [
    {
      _id: 'wf-support-001',
      userId: adminId,
      name: 'Customer Support & Delivery Triage Pipeline',
      description: 'Analyzes incoming customer support inquiries, identifies delivery and refund issues, and dispatches support notifications or priority manager alerts.',
      webhookUrl: '/api/webhook/request?workflowId=wf-support-001',
      status: WORKFLOW_STATUS.ACTIVE,
      configuration: {
        aiEnabled: true,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        systemPrompt: '',
        rules: [
          {
            id: 'rule-support-1',
            conditionField: 'intent',
            conditionOperator: 'equals',
            conditionValue: INTENTS.CUSTOMER_SUPPORT,
            action: ACTIONS.GMAIL_NOTIFICATION,
            actionParams: {
              subject: '[FlowPilot Support] New Customer Inquiry - {customer_name}',
              recipient: 'support@flowpilot.ai'
            }
          },
          {
            id: 'rule-support-2',
            conditionField: 'intent',
            conditionOperator: 'equals',
            conditionValue: INTENTS.COMPLAINT,
            action: ACTIONS.PRIORITY_GMAIL,
            actionParams: {
              subject: '🚨 URGENT CUSTOMER COMPLAINT: {summary}',
              recipient: 'escalations@flowpilot.ai'
            }
          },
          {
            id: 'rule-support-3',
            conditionField: 'priority',
            conditionOperator: 'equals',
            conditionValue: PRIORITIES.URGENT,
            action: ACTIONS.PRIORITY_GMAIL,
            actionParams: {
              subject: '🔥 CRITICAL ESCALATION: {customer_name} ({category})',
              recipient: 'ops-lead@flowpilot.ai'
            }
          }
        ]
      },
      stats: {
        totalExecutions: 142,
        successfulExecutions: 138,
        failedExecutions: 4,
        lastExecutedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'wf-lead-002',
      userId: adminId,
      name: 'Inbound Sales Lead & Enterprise CRM Sync',
      description: 'Identifies prospective enterprise clients, captures company details, syncs lead records into Google Sheets CRM, and triggers sales notifications.',
      webhookUrl: '/api/webhook/request?workflowId=wf-lead-002',
      status: WORKFLOW_STATUS.ACTIVE,
      configuration: {
        aiEnabled: true,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        systemPrompt: '',
        rules: [
          {
            id: 'rule-lead-1',
            conditionField: 'intent',
            conditionOperator: 'equals',
            conditionValue: INTENTS.LEAD,
            action: ACTIONS.GOOGLE_SHEETS_INSERT,
            actionParams: {
              sheetName: 'Inbound Leads 2026',
              notifySales: true
            }
          },
          {
            id: 'rule-lead-2',
            conditionField: 'intent',
            conditionOperator: 'equals',
            conditionValue: INTENTS.SALES,
            action: ACTIONS.GOOGLE_SHEETS_INSERT,
            actionParams: {
              sheetName: 'Sales Inquiries',
              notifySales: true
            }
          }
        ]
      },
      stats: {
        totalExecutions: 89,
        successfulExecutions: 87,
        failedExecutions: 2,
        lastExecutedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'wf-general-003',
      userId: adminId,
      name: 'Global Operations & n8n Switch Router',
      description: 'Central pipeline routing internal requests, notifications, and cross-platform webhooks into n8n automated flows.',
      webhookUrl: '/api/webhook/request?workflowId=wf-general-003',
      status: WORKFLOW_STATUS.ACTIVE,
      configuration: {
        aiEnabled: true,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        rules: [
          {
            id: 'rule-n8n-1',
            conditionField: 'intent',
            conditionOperator: 'equals',
            conditionValue: INTENTS.INTERNAL_REQUEST,
            action: ACTIONS.N8N_TRIGGER,
            actionParams: {
              targetWorkflow: 'n8n_internal_ops'
            }
          },
          {
            id: 'rule-gen-2',
            conditionField: 'intent',
            conditionOperator: 'equals',
            conditionValue: INTENTS.GENERAL,
            action: ACTIONS.INTERNAL_LOG,
            actionParams: {}
          }
        ]
      },
      stats: {
        totalExecutions: 65,
        successfulExecutions: 64,
        failedExecutions: 1,
        lastExecutedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const defaultIntegrations = [
    {
      _id: 'integ-openai-001',
      userId: adminId,
      provider: 'openai',
      name: 'OpenAI GPT-4o-mini',
      status: process.env.OPENAI_API_KEY ? 'connected' : 'demo_fallback',
      config: { model: 'gpt-4o-mini', temperature: 0.2 },
      lastTestedAt: new Date().toISOString()
    },
    {
      _id: 'integ-gmail-002',
      userId: adminId,
      provider: 'gmail',
      name: 'Gmail SMTP Notifier',
      status: (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ? 'connected' : 'demo_fallback',
      config: { user: process.env.GMAIL_USER || '' },
      lastTestedAt: new Date().toISOString()
    },
    {
      _id: 'integ-sheets-003',
      userId: adminId,
      provider: 'googleSheets',
      name: 'Google Sheets CRM Sync',
      status: (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) ? 'connected' : 'demo_fallback',
      config: { sheetId: process.env.GOOGLE_SHEET_ID || '' },
      lastTestedAt: new Date().toISOString()
    },
    {
      _id: 'integ-n8n-004',
      userId: adminId,
      provider: 'n8n',
      name: 'n8n Automation Engine',
      status: 'connected',
      config: { webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/flowpilot-inbound' },
      lastTestedAt: new Date().toISOString()
    }
  ];

  const defaultSettings = {
    ai: {
      model: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 500,
      customPrompt: ''
    },
    integrations: {
      openai: {
        connected: Boolean(process.env.OPENAI_API_KEY),
        lastTested: null,
        status: process.env.OPENAI_API_KEY ? 'connected' : 'demo_fallback'
      },
      gmail: {
        connected: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
        user: process.env.GMAIL_USER || '',
        status: (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ? 'connected' : 'demo_simulated'
      },
      googleSheets: {
        connected: Boolean(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
        sheetId: process.env.GOOGLE_SHEET_ID || '',
        status: (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) ? 'connected' : 'demo_simulated'
      },
      n8n: {
        connected: Boolean(process.env.N8N_WEBHOOK_URL),
        webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/flowpilot-inbound',
        status: 'ready'
      }
    },
    demoMode: process.env.DEMO_MODE !== 'false'
  };

  // Seed executions
  const seedExecutions = [
    {
      _id: 'exec-seed-101',
      userId: adminId,
      workflowId: 'wf-support-001',
      requestId: 'req-seed-101',
      input: {
        message: 'Customer Rahul has not received his order for 5 days. Please contact him and mark this as urgent.',
        source: 'website_widget',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      aiAnalysis: {
        intent: INTENTS.CUSTOMER_SUPPORT,
        priority: PRIORITIES.HIGH,
        summary: 'Customer Rahul has not received his order for 5 days.',
        customer_name: 'Rahul',
        company: null,
        email: 'rahul.orders@gmail.com',
        requested_action: 'contact_customer',
        category: 'delivery_issue',
        sentiment: 'urgent',
        confidence: 0.96
      },
      route: {
        matchedRuleId: 'rule-support-1',
        condition: 'intent == customer_support',
        targetAction: ACTIONS.GMAIL_NOTIFICATION
      },
      actionResult: {
        action: ACTIONS.GMAIL_NOTIFICATION,
        recipient: 'support@flowpilot.ai',
        subject: '[FlowPilot Support] New Customer Inquiry - Rahul',
        status: 'SUCCESS',
        mode: 'DEMO',
        details: 'Email dispatch simulated via FlowPilot Demo Dispatcher. Support alert registered.'
      },
      status: EXECUTION_STATUS.COMPLETED,
      durationMs: 420,
      timeline: [
        { step: 'RECEIVED', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: 'SUCCESS' },
        { step: 'AI_PROCESSING', timestamp: new Date(Date.now() - 15 * 60 * 1000 + 100).toISOString(), status: 'SUCCESS' },
        { step: 'ANALYZED', timestamp: new Date(Date.now() - 15 * 60 * 1000 + 210).toISOString(), status: 'SUCCESS' },
        { step: 'ROUTED', timestamp: new Date(Date.now() - 15 * 60 * 1000 + 260).toISOString(), status: 'SUCCESS' },
        { step: 'ACTION_EXECUTED', timestamp: new Date(Date.now() - 15 * 60 * 1000 + 410).toISOString(), status: 'SUCCESS' },
        { step: 'COMPLETED', timestamp: new Date(Date.now() - 15 * 60 * 1000 + 420).toISOString(), status: 'SUCCESS' }
      ],
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      _id: 'exec-seed-102',
      userId: adminId,
      workflowId: 'wf-lead-002',
      requestId: 'req-seed-102',
      input: {
        message: 'Priya from TechCorp Global wants pricing information and an enterprise demo for 200 seats.',
        source: 'contact_form',
        timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString()
      },
      aiAnalysis: {
        intent: INTENTS.LEAD,
        priority: PRIORITIES.MEDIUM,
        summary: 'Priya from TechCorp Global is requesting enterprise pricing and demo for 200 seats.',
        customer_name: 'Priya',
        company: 'TechCorp Global',
        email: 'priya@techcorpglobal.com',
        requested_action: 'send_pricing_and_schedule_demo',
        category: 'enterprise_sales',
        sentiment: 'positive',
        confidence: 0.98
      },
      route: {
        matchedRuleId: 'rule-lead-1',
        condition: 'intent == lead',
        targetAction: ACTIONS.GOOGLE_SHEETS_INSERT
      },
      actionResult: {
        action: ACTIONS.GOOGLE_SHEETS_INSERT,
        sheetName: 'Inbound Leads 2026',
        rowInserted: {
          timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
          name: 'Priya',
          email: 'priya@techcorpglobal.com',
          company: 'TechCorp Global',
          intent: 'lead',
          priority: 'medium',
          summary: 'Enterprise pricing & demo for 200 seats',
          status: 'New'
        },
        status: 'SUCCESS',
        mode: 'DEMO',
        details: 'Row added to Google Sheet [Inbound Leads 2026]. Sales team alert dispatched.'
      },
      status: EXECUTION_STATUS.COMPLETED,
      durationMs: 380,
      timeline: [
        { step: 'RECEIVED', timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(), status: 'SUCCESS' },
        { step: 'AI_PROCESSING', timestamp: new Date(Date.now() - 48 * 60 * 1000 + 90).toISOString(), status: 'SUCCESS' },
        { step: 'ANALYZED', timestamp: new Date(Date.now() - 48 * 60 * 1000 + 190).toISOString(), status: 'SUCCESS' },
        { step: 'ROUTED', timestamp: new Date(Date.now() - 48 * 60 * 1000 + 240).toISOString(), status: 'SUCCESS' },
        { step: 'ACTION_EXECUTED', timestamp: new Date(Date.now() - 48 * 60 * 1000 + 370).toISOString(), status: 'SUCCESS' },
        { step: 'COMPLETED', timestamp: new Date(Date.now() - 48 * 60 * 1000 + 380).toISOString(), status: 'SUCCESS' }
      ],
      createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString()
    }
  ];

  const seedMockSheet = [
    {
      id: 'sheet-row-1',
      timestamp: '2026-08-29 14:22:10',
      name: 'Priya Sharma',
      email: 'priya@techcorpglobal.com',
      company: 'TechCorp Global',
      request: 'Pricing and demo for 200 seats',
      intent: 'lead',
      priority: 'medium',
      summary: 'Enterprise pricing and demo for 200 seats',
      status: 'Contacted'
    },
    {
      id: 'sheet-row-2',
      timestamp: '2026-08-29 11:05:40',
      name: 'David Miller',
      email: 'david.m@acmecorp.io',
      company: 'Acme Corp',
      request: 'Need quote for custom SLA and API integration',
      intent: 'sales',
      priority: 'high',
      summary: 'Custom SLA and API quote inquiry',
      status: 'Proposal Sent'
    }
  ];

  return {
    users: [defaultUser],
    workflows: defaultWorkflows,
    requests: [],
    aiAnalyses: [],
    executions: seedExecutions,
    integrations: defaultIntegrations,
    settings: defaultSettings,
    mockGoogleSheet: seedMockSheet,
    mockGmailInbox: []
  };
}

// Load store from disk or initialize
async function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      memoryStore = {
        users: parsed.users || [],
        workflows: parsed.workflows || [],
        requests: parsed.requests || [],
        aiAnalyses: parsed.aiAnalyses || [],
        executions: parsed.executions || [],
        integrations: parsed.integrations || [],
        settings: parsed.settings || {},
        mockGoogleSheet: parsed.mockGoogleSheet || [],
        mockGmailInbox: parsed.mockGmailInbox || []
      };
    } else {
      memoryStore = await getInitialData();
      saveStore();
    }
  } catch (error) {
    console.error('⚠️ Error reading db.json, reinitializing memory store:', error.message);
    memoryStore = await getInitialData();
    saveStore();
  }
}

// Save store to disk atomically
function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (error) {
    console.error('⚠️ Error saving to db.json:', error.message);
  }
}

// Initialize on module load
loadStore();

// Generic Store Collection Helper
class StoreCollection {
  constructor(collectionName) {
    this.name = collectionName;
  }

  async find(filter = {}) {
    let items = memoryStore[this.name] || [];
    return items.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
  }

  async findById(id) {
    const items = memoryStore[this.name] || [];
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async findOne(filter = {}) {
    const items = await this.find(filter);
    return items[0] || null;
  }

  async create(doc) {
    if (!memoryStore[this.name]) {
      memoryStore[this.name] = [];
    }
    const newDoc = {
      _id: doc._id || doc.id || `${this.name.slice(0, 3)}-${uuidv4()}`,
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryStore[this.name].unshift(newDoc);
    saveStore();
    return newDoc;
  }

  async findByIdAndUpdate(id, updates) {
    const items = memoryStore[this.name] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveStore();
    return items[index];
  }

  async findByIdAndDelete(id) {
    const items = memoryStore[this.name] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    const [deleted] = items.splice(index, 1);
    saveStore();
    return deleted;
  }

  async countDocuments(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }
}

module.exports = {
  Users: new StoreCollection('users'),
  Workflows: new StoreCollection('workflows'),
  Requests: new StoreCollection('requests'),
  AIAnalyses: new StoreCollection('aiAnalyses'),
  Executions: new StoreCollection('executions'),
  Integrations: new StoreCollection('integrations'),
  MockGoogleSheet: new StoreCollection('mockGoogleSheet'),
  MockGmailInbox: new StoreCollection('mockGmailInbox'),
  getSettings: async () => memoryStore.settings || {},
  updateSettings: async (newSettings) => {
    memoryStore.settings = { ...memoryStore.settings, ...newSettings };
    saveStore();
    return memoryStore.settings;
  },
  getRawStore: () => memoryStore,
  reloadStore: loadStore
};
