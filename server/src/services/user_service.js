// server/src/services/user_service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

async function register({ name, email, address, phone, password }) {
    if (!password) throw new Error('Password is required');

    const exists = await User.findOne({ email });
    if (exists) {
        const err = new Error('Email already in use');
        err.status = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
        // ❌ אין id ידני
        name, email, address, phone, passwordHash,
        joinedGroups: [], createdGroups: [], voteHistory: [],
    });

    const { passwordHash: _pwd, ...safe } = user.toObject();
    return safe; // מכיל גם _id
}

async function login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        throw err;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        throw err;
    }

    // 👉 מזהה המשתמש יהיה ה-ObjectId
    const token = jwt.sign(
        { sub: user._id.toString() },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );

    const { passwordHash: _pwd, ...safe } = user.toObject();
    return { token, user: safe };
}

async function getProfile(userIdFromToken) {
    // 👉 חיפוש לפי _id שהגיע מה-JWT
    const user = await User.findById(userIdFromToken);
    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return user;
}

// ✅ פונקציה שמחזירה את כל המשתמשים (ללא סיסמאות)
async function listUsers() {
    return User.find({}, { passwordHash: 0 }).lean();
}


module.exports = {
    register,
    login,
    getProfile,
    listUsers,
};
