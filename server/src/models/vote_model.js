const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

voteSchema.index({ userId: 1, groupId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
