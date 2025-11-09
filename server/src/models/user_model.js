const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String, required: true, unique: true,
        lowercase: true, trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },
    city: { type: String, trim: true },       // תגיע מה-API החיצוני
    address: { type: String, trim: true },    // תגיע מה-API החיצוני
    phone: {
        type: String, trim: true,
        match: [/^[\d+\-\s()]{6,20}$/, 'Invalid phone number']
    },
    passwordHash: { type: String, required: true, select: false },

    joinedGroups: [{ type: String }],
    createdGroups: [{ type: String }],
    voteHistory: [{ type: String }],
}, {
    timestamps: true,
    versionKey: false,
});

module.exports = mongoose.model('User', userSchema);
