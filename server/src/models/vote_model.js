const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: String, required: true },                      // מזהה המשתמש שהצביע
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },  // קישור לקבוצה
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true }, // קישור למועמד
  timestamp: { type: Date, default: Date.now }                   // זמן ההצבעה
});

// יצירת המודל
const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
