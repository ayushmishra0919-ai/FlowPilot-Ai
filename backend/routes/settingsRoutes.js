const express = require('express');
const router = express.Router();
const { fetchSettings, saveSettings, testIntegration, getMockData } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', fetchSettings);
router.put('/', protect, saveSettings);
router.post('/test-integration', protect, testIntegration);
router.get('/mock-data', protect, getMockData);

module.exports = router;
