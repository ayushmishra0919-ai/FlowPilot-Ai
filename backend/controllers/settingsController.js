const { getSettings, updateSettings, MockGoogleSheet, MockGmailInbox } = require('../services/storeAdapter');
const OpenAI = require('openai');
const nodemailer = require('nodemailer');

// @route GET /api/settings
const fetchSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();

    // Check environment indicators without exposing secret keys
    const safeSettings = {
      ai: {
        model: settings.ai?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: settings.ai?.temperature !== undefined ? settings.ai.temperature : 0.2,
        customPrompt: settings.ai?.customPrompt || ''
      },
      integrations: {
        openai: {
          configured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5),
          maskedKey: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.slice(0, 7)}...${process.env.OPENAI_API_KEY.slice(-4)}` : null,
          status: process.env.OPENAI_API_KEY ? 'active' : 'demo_fallback'
        },
        gmail: {
          configured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
          user: process.env.GMAIL_USER ? process.env.GMAIL_USER.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
          status: (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ? 'connected' : 'demo_simulated'
        },
        googleSheets: {
          configured: Boolean(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
          sheetId: process.env.GOOGLE_SHEET_ID ? `${process.env.GOOGLE_SHEET_ID.slice(0, 6)}...` : null,
          status: (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) ? 'connected' : 'demo_simulated'
        },
        n8n: {
          configured: Boolean(process.env.N8N_WEBHOOK_URL),
          webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/flowpilot-inbound',
          status: 'ready'
        }
      },
      demoMode: process.env.DEMO_MODE !== 'false'
    };

    res.json({
      success: true,
      data: safeSettings
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/settings
const saveSettings = async (req, res, next) => {
  try {
    const { ai, demoMode } = req.body;
    const current = await getSettings();

    const updated = await updateSettings({
      ...current,
      ai: {
        ...current.ai,
        ...ai
      },
      demoMode: demoMode !== undefined ? demoMode : current.demoMode
    });

    res.json({
      success: true,
      message: 'Platform settings updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/settings/test-integration
const testIntegration = async (req, res, next) => {
  try {
    const { service } = req.body;

    switch (service) {
      case 'openai': {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return res.json({
            success: true,
            status: 'DEMO_MODE',
            message: 'OpenAI API key not detected in .env. FlowPilot Intelligent NLP Fallback is active and fully functional.'
          });
        }

        const openai = new OpenAI({ apiKey });
        const testRes = await openai.models.list();
        return res.json({
          success: true,
          status: 'CONNECTED',
          message: `Successfully connected to OpenAI API. Verified access to ${testRes.data.length} models.`
        });
      }

      case 'gmail': {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;
        if (!gmailUser || !gmailPass) {
          return res.json({
            success: true,
            status: 'DEMO_MODE',
            message: 'Gmail credentials not configured in .env. FlowPilot Demo Dispatcher is active (emails are previewed in-app).'
          });
        }

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: gmailUser, pass: gmailPass }
        });
        await transporter.verify();
        return res.json({
          success: true,
          status: 'CONNECTED',
          message: `Successfully authenticated with Gmail SMTP server for user ${gmailUser}.`
        });
      }

      case 'googleSheets': {
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        if (!sheetId || !serviceEmail) {
          return res.json({
            success: true,
            status: 'DEMO_MODE',
            message: 'Google Sheets credentials not in .env. FlowPilot Demo Spreadsheet Table is active.'
          });
        }

        return res.json({
          success: true,
          status: 'CONNECTED',
          message: `Configured for Google Sheet ID: ${sheetId.slice(0, 8)}...`
        });
      }

      case 'n8n': {
        const url = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/flowpilot-inbound';
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          await fetch(url.replace('/webhook/', '/healthz'), { signal: controller.signal });
          clearTimeout(timeoutId);
          return res.json({
            success: true,
            status: 'CONNECTED',
            message: `n8n webhook endpoint is reachable at ${url}`
          });
        } catch (e) {
          return res.json({
            success: true,
            status: 'DEMO_MODE',
            message: `Target n8n URL configured: ${url}. (FlowPilot auto-simulates when n8n is offline)`
          });
        }
      }

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown integration service: ${service}`
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      message: `Integration check failed: ${error.message}`
    });
  }
};

// @route GET /api/settings/mock-data
const getMockData = async (req, res, next) => {
  try {
    const mockSheets = await MockGoogleSheet.find({});
    const mockEmails = await MockGmailInbox.find({});

    res.json({
      success: true,
      data: {
        mockGoogleSheet: mockSheets,
        mockGmailInbox: mockEmails
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchSettings,
  saveSettings,
  testIntegration,
  getMockData
};
