const express = require('express');
const router = express.Router();
const { getRequests } = require('../controllers/requestController');
const { handleWebhookRequest } = require('../controllers/webhookController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRequests);
router.post('/', handleWebhookRequest); // Also allows creating/simulating request directly

module.exports = router;
