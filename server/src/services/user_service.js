const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch'); // אם Node <18: npm install node-fetch
const User = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';


function generateToken(userId) {
    return jwt.sign({ sub: userId.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// מחזיר רשימת כתובות לפי חיפוש ZIP או רחוב


async function register({ firstName, lastName, email, phone, city, address, password }) {
    // בדיקה אם המייל כבר קיים
    const exists = await User.findOne({ email });
    if (exists) throw Object.assign(new Error('המייל קיים כבר'), { status: 409 });

    // הצפנת סיסמה
    const passwordHash = await bcrypt.hash(password, 12);

    // יצירת המשתמש במסד
    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        city: city || '', // ← ודאי שיש ערך
        address, // הכתובת שמתקבלת מהלקוח
        passwordHash,
        joinedGroups: [],
        createdGroups: [],
        voteHistory: []
    });

    // יצירת טוקן
    const token = generateToken(user._id);
    const { passwordHash: _pwd, ...safe } = user.toObject();
    return { token, user: safe };
}


async function login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw Object.assign(new Error('משתמש לא קיים'), { status: 404 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Object.assign(new Error('סיסמה לא נכונה'), { status: 401 });

    const token = generateToken(user._id);
    const { passwordHash: _pwd, ...safe } = user.toObject();
    return { token, user: safe };
}

async function getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return user;
}

async function listUsers() {
    return User.find({}, { passwordHash: 0 }).lean();
}

async function updateProfile(userId, updates) {
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'address', 'password'];
    const dataToUpdate = {};

    for (let key of allowedFields) {
        if (updates[key] !== undefined) {
            if (key === 'password') {
                dataToUpdate.passwordHash = await bcrypt.hash(updates.password, 12);
            } else {
                dataToUpdate[key] = updates[key];
            }
        }
    }

    const user = await User.findByIdAndUpdate(userId, dataToUpdate, { new: true }).select('-passwordHash');
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

    return user;
}




module.exports = {
    register,
    login,
    getProfile,
    listUsers,
    updateProfile,
};
