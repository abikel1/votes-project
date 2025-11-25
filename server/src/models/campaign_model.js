// src/models/campaign_model.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  image: { type: String, default: '' },  // תמונה יחידה לפוסט
  createdAt: { type: Date, default: Date.now }
});

const campaignSchema = new mongoose.Schema({
  candidate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true 
  },

  description: { type: String, default: '' },

  // פוסטים
  posts: [postSchema],

  // גלריית תמונות של הקמפיין (לא קשור לפוסטים)
  gallery: [String], // ← מערך תמונות URL

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
