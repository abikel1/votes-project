const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String, required: true, unique: true,
        lowercase: true, trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },
    address: { type: String, trim: true },
    phone: {
        type: String, trim: true,
        match: [/^[\d+\-\s()]{6,20}$/, 'Invalid phone number']
    },
    // נשמר מוצפן, ולא נשלף כברירת מחדל
    passwordHash: { type: String, required: true, select: false },

    joinedGroups: [{ type: String }],
    createdGroups: [{ type: String }],
    voteHistory: [{ type: String }],
}, {
    timestamps: true,
    versionKey: false,
});

// אם פעם היה אינדקס על id, השורה הבאה תדאג שלא קיים יותר.
// נשאיר רק ייחוד על email
// userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
