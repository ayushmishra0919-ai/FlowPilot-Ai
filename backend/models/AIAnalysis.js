const mongoose = require('mongoose');
const { INTENTS, PRIORITIES } = require('../config/constants');

const AIAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      index: true
    },
    workflowId: {
      type: String,
      index: true
    },
    requestId: {
      type: String,
      required: true,
      index: true
    },
    intent: {
      type: String,
      enum: Object.values(INTENTS),
      required: true
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITIES),
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    customer_name: {
      type: String,
      default: 'Unknown'
    },
    company: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null
    },
    requested_action: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'general'
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'urgent'],
      default: 'neutral'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.95
    },
    rawAiResponse: {
      type: mongoose.Schema.Types.Mixed
    },
    modelUsed: {
      type: String,
      default: 'gpt-4o-mini'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.AIAnalysis || mongoose.model('AIAnalysis', AIAnalysisSchema);
