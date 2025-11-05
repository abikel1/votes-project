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
        name, email, address, phone, passwordHash,
        joinedGroups: [], createdGroups: [], voteHistory: [],
    });

    // 👉 אוטו-לוגין: מחזירים טוקן אחרי רישום. אם לא רוצים – החזירי רק `safe`
    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const { passwordHash: _pwd, ...safe } = user.toObject();
    return { token, user: safe };
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

    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const { passwordHash: _pwd, ...safe } = user.toObject();
    return { token, user: safe };
}

async function getProfile(userIdFromToken) {
    const user = await User.findById(userIdFromToken).select('-passwordHash');
    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return user;
}

async function listUsers() {
    return User.find({}, { passwordHash: 0 }).lean();
}

module.exports = { register, login, getProfile, listUsers };
