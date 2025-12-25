const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  name: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const candidateRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String },
  name: { type: String },
  description: { type: String },
  symbol: { type: String },
  photoUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'removed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });


const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: String, required: true },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creationDate: { type: Date, default: Date.now },
  candidateEndDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
  maxWinners: { type: Number, default: 1 },
  shareLink: { type: String },
  votes: [{ type: String }],
  participants: [{ type: String }],
  isLocked: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [joinRequestSchema],
  candidateRequests: [candidateRequestSchema],
});

module.exports = mongoose.model('Group', groupSchema);
