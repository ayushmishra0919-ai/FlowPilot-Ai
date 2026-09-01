/**
 * FlowPilot AI — Intelligent Workflow Automation Platform
 * Express Server Entry Point (Supports both Standalone Node.js & Vercel Serverless)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDbStatus } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const requestRoutes = require('./routes/requestRoutes');
const executionRoutes = require('./routes/executionRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Universal CORS & Preflight Options Handler
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.headers.origin) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB connection for Serverless & Standalone execution
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // Non-blocking database connection attempt
  }
  next();
});

// Request Logging Middleware (Development)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root & Health Diagnostic Endpoint
const healthHandler = (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'HEALTHY',
    service: 'FlowPilot AI Core Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    aiEngine: process.env.OPENAI_API_KEY ? 'OpenAI GPT (Live)' : 'FlowPilot Intelligent NLP Engine (Demo/Fallback)',
    demoMode: process.env.DEMO_MODE !== 'false',
    deployment: process.env.VERCEL ? 'Vercel Serverless' : 'Node.js Standalone'
  });
};

app.get('/', (req, res) => {
  res.json({
    name: 'FlowPilot AI API',
    status: 'ONLINE',
    version: '1.0.0',
    docs: '/api/health',
    endpoints: {
      health: '/api/health',
      webhook: '/api/webhook/request',
      workflows: '/api/workflows',
      executions: '/api/executions',
      analytics: '/api/analytics',
      auth: '/api/auth/login'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'FlowPilot AI API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      webhook: '/api/webhook/request',
      workflows: '/api/workflows',
      executions: '/api/executions',
      analytics: '/api/analytics'
    }
  });
});

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount Application Routes (Mounted with /api prefix and root alias for flexible routing)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/workflows', workflowRoutes);
app.use('/workflows', workflowRoutes);

app.use('/api/requests', requestRoutes);
app.use('/requests', requestRoutes);

app.use('/api/executions', executionRoutes);
app.use('/executions', executionRoutes);

app.use('/api/webhook', webhookRoutes);
app.use('/webhook', webhookRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect DB & Start Standalone Server
let server;
const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`
===========================================================
🚀 FlowPilot AI Engine is running on port: ${PORT}
📡 Webhook Endpoint: http://localhost:${PORT}/api/webhook/request
📊 Health Status:    http://localhost:${PORT}/api/health
🌐 Client Origin:    ${process.env.CLIENT_URL || 'http://localhost:5173'}
===========================================================
    `);
  });
  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.app = app;
module.exports.startServer = startServer;
