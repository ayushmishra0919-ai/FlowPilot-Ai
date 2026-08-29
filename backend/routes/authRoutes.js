const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
