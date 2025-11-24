// const mongoose = require('mongoose');

// const candidateSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String },
//   photoUrl: { type: String },
//   symbol: { type: String },
//   groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
//   createdAt: { type: Date, default: Date.now },
//   votesCount: { type: Number, default: 0 },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

// });

// const Candidate = mongoose.model('Candidate', candidateSchema);
// module.exports = Candidate;


const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    // required: true 
  },

  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },

  name: { type: String, required: true },
  description: { type: String },
  photoUrl: { type: String },
  symbol: { type: String },

  createdAt: { type: Date, default: Date.now },
  votesCount: { type: Number, default: 0 }
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;


