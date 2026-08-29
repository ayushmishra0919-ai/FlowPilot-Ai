/**
 * FlowPilot AI — Intelligent Workflow Automation Platform
 * Express Server Entry Point
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

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware (Development)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health & System Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'HEALTHY',
    service: 'FlowPilot AI Core Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    aiEngine: process.env.OPENAI_API_KEY ? 'OpenAI GPT (Live)' : 'FlowPilot Intelligent NLP Engine (Demo/Fallback)',
    demoMode: process.env.DEMO_MODE !== 'false'
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect DB & Start Server
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

module.exports = { app, startServer };
