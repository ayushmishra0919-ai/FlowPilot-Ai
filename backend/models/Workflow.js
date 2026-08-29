const mongoose = require('mongoose');
const { WORKFLOW_STATUS } = require('../config/constants');

const RuleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  conditionField: { type: String, required: true },
  conditionOperator: { type: String, enum: ['equals', 'not_equals', 'contains', 'in'], default: 'equals' },
  conditionValue: { type: String, required: true },
  action: { type: String, required: true },
  actionParams: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const WorkflowSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a workflow name'],
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    webhookUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS),
      default: WORKFLOW_STATUS.ACTIVE
    },
    configuration: {
      aiEnabled: { type: Boolean, default: true },
      model: { type: String, default: 'gpt-4o-mini' },
      temperature: { type: Number, default: 0.2 },
      systemPrompt: { type: String, default: '' },
      rules: [RuleSchema]
    },
    stats: {
      totalExecutions: { type: Number, default: 0 },
      successfulExecutions: { type: Number, default: 0 },
      failedExecutions: { type: Number, default: 0 },
      lastExecutedAt: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Workflow || mongoose.model('Workflow', WorkflowSchema);
