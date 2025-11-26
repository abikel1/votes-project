// server/src/models/group_model.js
const mongoose = require('mongoose');

// סכמת בקשת הצטרפות כחבר בקבוצה
const joinRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  name: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

// סכמת בקשת מועמדות (למערכת ההצבעות)
const candidateRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String },
  name: { type: String },
  description: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'removed'], // ⬅️ הוספנו 'removed'
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: String, required: true }, // אימייל היוצר
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creationDate: { type: Date, default: Date.now },

  candidateEndDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
  maxWinners: { type: Number, default: 1 },
  shareLink: { type: String },
  votes: [{ type: String }],
  participants: [{ type: String }],

  // נעילה + הצטרפות
  isLocked: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [joinRequestSchema],

  // בקשות מועמדות
  candidateRequests: [candidateRequestSchema],
});

module.exports = mongoose.model('Group', groupSchema);
