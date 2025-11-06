const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  description:  { type: String },
  createdBy:    { type: String, required: true },                // אימייל היוצר
  createdById:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // מזהה היוצר (לא חובה, מומלץ)
  creationDate: { type: Date, default: Date.now },
  endDate:      { type: Date, required: true },
  candidates:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
  maxWinners:   { type: Number, default: 1 },
  shareLink:    { type: String },
  votes:        [{ type: String }],
  participants: [{ type: String }]
});

module.exports = mongoose.model('Group', groupSchema);
