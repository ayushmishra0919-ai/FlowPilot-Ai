const express = require('express');
const router = express.Router();
const {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflowStatus
} = require('../controllers/workflowController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getWorkflows);
router.post('/', protect, createWorkflow);
router.get('/:id', getWorkflowById);
router.put('/:id', protect, updateWorkflow);
router.delete('/:id', protect, deleteWorkflow);
router.patch('/:id/status', protect, toggleWorkflowStatus);

module.exports = router;
