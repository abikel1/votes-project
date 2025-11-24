// src/models/campaign_model.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  description: { type: String, default: '' },
  posts: [
    {
      text: String,
      images: [String],
      videos: [String],
      createdAt: { type: Date, default: Date.now },
    }
  ],
  polls: [
    {
      question: String,
      options: [String],
      votes: [mongoose.Schema.Types.ObjectId],
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
