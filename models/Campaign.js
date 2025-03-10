const mongoose = require('mongoose');

const sequenceStepSchema = new mongoose.Schema({
  order: Number,
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  subject: String,
  content: String,
  variants: [{
    subject: String,
    content: String
  }],
  delay: {
    days: Number,
    hours: Number
  }
});

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Paused', 'Completed'],
    default: 'Draft'
  },
  schedule: {
    start: Date,
    end: Date,
    timezone: String,
    days: [String],
    timing: {
      from: String,
      to: String
    }
  },
  sequences: [sequenceStepSchema],
  analytics: {
    opens: Number,
    clicks: Number,
    opportunities: Number,
    conversions: Number,
    revenue: Number
  },
  options: {
    accounts: [String],
    tracking: {
      opens: Boolean,
      clicks: Boolean
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);