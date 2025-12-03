// server/src/models/campaign_model.js
const mongoose = require('mongoose');

// 🆕 סכמה לתגובות
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✏️ עדכון סכמת פוסט
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  image: { type: String, default: '' },
  
  // 🆕 הוספת YouTube
  youtubeUrl: { type: String, default: '' },
  
  // 🆕 הוספת תגובות
  comments: [commentSchema],
  
  createdAt: { type: Date, default: Date.now }
});

const campaignSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    unique: true,
  },

  description: { type: String, default: '' },
  posts: [postSchema],
  gallery: [String],
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);