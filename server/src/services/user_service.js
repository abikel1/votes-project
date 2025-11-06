const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

async function register({ name, email, address, phone, password }) {
    const exists = await User.findOne({ email });
    if (exists) throw Object.assign(new Error('Email already in use'), { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, address, phone, passwordHash, joinedGroups: [], createdGroups: [], voteHistory: [] });

    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const { passwordHash: _pwd, ...safe } = user.toObject();
    return { token, user: safe };
}

async function login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw Object.assign(new Error('משתמש לא קיים'), { status: 404 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Object.assign(new Error('סיסמה לא נכונה'), { status: 401 });

    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const { passwordHash: _pwd, ...safe } = user.toObject();
    return { token, user: safe };
}

async function getProfile(userIdFromToken) {
    const user = await User.findById(userIdFromToken).select('-passwordHash');
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return user;
}

async function listUsers() {
    return User.find({}, { passwordHash: 0 }).lean();
}

module.exports = { register, login, getProfile, listUsers };
