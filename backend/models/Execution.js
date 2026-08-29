const mongoose = require('mongoose');
const { EXECUTION_STATUS } = require('../config/constants');

const TimelineStepSchema = new mongoose.Schema({
  step: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'SKIPPED'], default: 'SUCCESS' },
  durationMs: { type: Number, default: 0 },
  details: { type: String }
});

const ExecutionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      index: true
    },
    workflowId: {
      type: String,
      required: true,
      index: true
    },
    requestId: {
      type: String,
      required: true,
      index: true
    },
    input: {
      message: { type: String, required: true },
      source: { type: String, default: 'webhook' },
      timestamp: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed }
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    route: {
      matchedRuleId: { type: String },
      condition: { type: String },
      targetAction: { type: String }
    },
    actionResult: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: Object.values(EXECUTION_STATUS),
      default: EXECUTION_STATUS.RECEIVED
    },
    durationMs: {
      type: Number,
      default: 0
    },
    timeline: [TimelineStepSchema],
    isDemo: {
      type: Boolean,
      default: false
    },
    error: {
      message: { type: String },
      stack: { type: String },
      step: { type: String }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Execution || mongoose.model('Execution', ExecutionSchema);
