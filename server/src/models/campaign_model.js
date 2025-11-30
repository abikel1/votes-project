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
    required: true,
    unique: true, // 👈 קמפיין אחד לכל מועמד
  },

  description: { type: String, default: '' },
  posts: [postSchema],
  gallery: [String],
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
