const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ['openai', 'gmail', 'googleSheets', 'n8n'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['connected', 'demo_fallback', 'error', 'disconnected'],
      default: 'demo_fallback'
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    lastTestedAt: {
      type: Date
    },
    lastError: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

IntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

module.exports = mongoose.models.Integration || mongoose.model('Integration', IntegrationSchema);
