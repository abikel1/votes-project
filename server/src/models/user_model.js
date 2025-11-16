const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  city:    { type: String, trim: true },
  address: { type: String, trim: true },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d+\-\s()]{6,20}$/, 'Invalid phone number'],
  },

  // ❗ כבר לא required – מאפשר יוזר שנוצר רק מגוגל בלי סיסמה
  passwordHash: {
    type: String,
    select: false,
  },

  // מאיפה המשתמש נוצר
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  joinedGroups:  [{ type: String }],
  createdGroups: [{ type: String }],
  voteHistory:   [{ type: String }],
}, {
  timestamps: true,
  versionKey: false,
});

module.exports = mongoose.model('User', userSchema);
