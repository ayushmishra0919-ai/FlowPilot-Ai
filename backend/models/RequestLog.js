const mongoose = require('mongoose');

const RequestLogSchema = new mongoose.Schema(
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
    rawMessage: {
      type: String,
      required: [true, 'Raw incoming message is required']
    },
    source: {
      type: String,
      default: 'webhook'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.RequestLog || mongoose.model('RequestLog', RequestLogSchema);
