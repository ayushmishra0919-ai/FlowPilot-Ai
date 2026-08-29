/**
 * FlowPilot AI Automated API & Integration Test Suite
 */

process.env.NODE_ENV = 'test';
process.env.DEMO_MODE = 'true';
process.env.MONGODB_URI = '';

const http = require('http');
const { app } = require('../server');
const { analyzeRequest, extractWithIntelligentNlp } = require('../services/aiService');
const { determineRoute } = require('../services/routerService');
const { INTENTS, PRIORITIES, ACTIONS } = require('../config/constants');
const { connectDB } = require('../config/db');

let server;
const TEST_PORT = 5099;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 ===============================================');
  console.log('🧪 Starting FlowPilot AI Automated Verification Suite');
  console.log('🧪 ===============================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Connect DB and start test server
  await connectDB();
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      resolve();
    });
  });

  try {
    // Test 1: Core AI NLP Fallback & Structuring
    console.log('▶ Testing AI Structuring & Entity Extraction Engine...');
    const corePrompt = "Rahul from ABC Technologies wants an enterprise product demo. Please notify the sales team.";
    const coreAnalysis = extractWithIntelligentNlp(corePrompt);
    assert(coreAnalysis.intent === INTENTS.LEAD, `Core Prompt Intent is lead (got: ${coreAnalysis.intent})`);
    assert(coreAnalysis.customer_name === 'Rahul', `Core Prompt Customer Name is 'Rahul' (got: ${coreAnalysis.customer_name})`);
    assert(coreAnalysis.company === 'ABC Technologies', `Core Prompt Company is 'ABC Technologies' (got: ${coreAnalysis.company})`);
    assert(coreAnalysis.priority === PRIORITIES.MEDIUM || coreAnalysis.priority === PRIORITIES.LOW, `Core Prompt Priority determined (got: ${coreAnalysis.priority})`);

    const supportPrompt = "Customer Rahul has not received his order for 5 days. Please contact him and mark this as urgent.";
    const analysis1 = extractWithIntelligentNlp(supportPrompt);
    assert(analysis1.intent === INTENTS.CUSTOMER_SUPPORT, `Correctly identified customer_support intent (got: ${analysis1.intent})`);
    assert(analysis1.priority === PRIORITIES.URGENT || analysis1.priority === PRIORITIES.HIGH, `Correctly detected high/urgent priority (got: ${analysis1.priority})`);
    assert(analysis1.customer_name === 'Rahul', `Extracted customer name 'Rahul'`);

    // Test 2: Conditional Routing Engine
    console.log('\n▶ Testing Conditional Router...');
    const mockWorkflow = {
      configuration: {
        rules: [
          { conditionField: 'intent', conditionOperator: 'equals', conditionValue: 'lead', action: ACTIONS.GOOGLE_SHEETS_INSERT },
          { conditionField: 'intent', conditionOperator: 'equals', conditionValue: 'customer_support', action: ACTIONS.GMAIL_NOTIFICATION }
        ]
      }
    };
    const route1 = determineRoute(analysis1, mockWorkflow);
    assert(route1.targetAction === ACTIONS.GMAIL_NOTIFICATION, `Routed customer support to Gmail Notification (got: ${route1.targetAction})`);

    const route2 = determineRoute(coreAnalysis, mockWorkflow);
    assert(route2.targetAction === ACTIONS.GOOGLE_SHEETS_INSERT, `Routed lead to Google Sheets Insert (got: ${route2.targetAction})`);

    // Test 3: Health Endpoint
    console.log('\n▶ Testing /api/health Endpoint...');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, `Health check returned status 200 (got: ${health.status})`);
    assert(health.body?.status === 'HEALTHY', `Health status is HEALTHY`);

    // Test 4: Auth Flow
    console.log('\n▶ Testing Authentication System...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'demo@flowpilot.ai',
      password: 'password123'
    });
    assert(loginRes.status === 200, `Default admin login succeeded (status ${loginRes.status})`);
    assert(Boolean(loginRes.body?.token), `JWT access token received`);
    const token = loginRes.body?.token;

    const meRes = await request('GET', '/api/auth/me', null, token);
    assert(meRes.status === 200, `Profile /api/auth/me retrieved`);
    assert(meRes.body?.data?.email === 'demo@flowpilot.ai', `Verified authenticated user email`);

    // Test 5: Inbound Webhook Execution Pipeline (Exact requirement 27 test)
    console.log('\n▶ Testing End-to-End Inbound Webhook Execution...');
    const webhookRes = await request('POST', '/api/webhook/request', {
      message: "Rahul from ABC Technologies wants an enterprise product demo. Please notify the sales team.",
      source: "website_contact_form"
    });
    assert(webhookRes.status === 200, `Webhook ingested successfully (status ${webhookRes.status})`);
    assert(webhookRes.body?.success === true, `Webhook execution marked success`);
    assert(webhookRes.body?.intent === 'lead', `AI pipeline classified as lead`);
    assert(webhookRes.body?.aiAnalysis?.customer_name === 'Rahul', `Extracted customer name 'Rahul'`);
    assert(webhookRes.body?.aiAnalysis?.company === 'ABC Technologies', `Extracted company 'ABC Technologies'`);
    assert(webhookRes.body?.action === ACTIONS.GOOGLE_SHEETS_INSERT, `Conditional router selected Google Sheets action`);
    assert(webhookRes.body?.timeline?.length >= 5, `Timeline recorded with micro-steps (got ${webhookRes.body?.timeline?.length})`);

    // Test 6: Validation & Error Handling
    console.log('\n▶ Testing Validation & Error Handling...');
    const emptyWebhook = await request('POST', '/api/webhook/request', { message: '' });
    assert(emptyWebhook.status === 400, `Rejected empty payload with status 400`);

    // Test 7: Execution History & Analytics
    console.log('\n▶ Testing Execution History & Analytics Aggregation...');
    const execsRes = await request('GET', '/api/executions?limit=5');
    assert(execsRes.status === 200, `Executions list fetched (status ${execsRes.status})`);
    assert(execsRes.body?.total > 0, `Execution history contains recorded items (total: ${execsRes.body?.total})`);

    const analyticsRes = await request('GET', '/api/analytics');
    assert(analyticsRes.status === 200, `Analytics metrics retrieved`);
    assert(analyticsRes.body?.data?.summary?.totalRequests > 0, `Analytics shows recorded requests`);

    // Test 8: Workflows
    console.log('\n▶ Testing Workflows Engine...');
    const workflowsRes = await request('GET', '/api/workflows');
    assert(workflowsRes.status === 200, `Workflows list fetched (total: ${workflowsRes.body?.count})`);

  } catch (err) {
    console.error('❌ Test suite execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n===============================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
