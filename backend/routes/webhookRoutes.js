const express = require('express');
const router = express.Router();
const { handleWebhookRequest } = require('../controllers/webhookController');
const { webhookRateLimiter } = require('../middleware/rateLimitMiddleware');

// Inbound webhook endpoint with rate-limiting
router.post('/request', webhookRateLimiter, handleWebhookRequest);

module.exports = router;
