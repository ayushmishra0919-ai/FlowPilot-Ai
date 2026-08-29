const express = require('express');
const router = express.Router();
const { getExecutions, getExecutionById, clearExecutions } = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getExecutions);
router.get('/:id', getExecutionById);
router.delete('/', protect, clearExecutions);

module.exports = router;
