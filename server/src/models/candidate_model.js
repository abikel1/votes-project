const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  photoUrl: { type: String },
  symbol: { type: String },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  createdAt: { type: Date, default: Date.now },
  votesCount: { type: Number, default: 0 }
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;




// const mongoose = require('mongoose');

// const candidateSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
//   description: { type: String, trim: true },
//   photoUrl: { type: String, trim: true },
//   symbol: { type: String, trim: true, uppercase: true, maxlength: 10 },
//   groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
//   votesCount: { type: Number, default: 0 },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//   createdAt: { type: Date, default: Date.now }
// });

// const Candidate = mongoose.model('Candidate', candidateSchema);
// module.exports = Candidate;
