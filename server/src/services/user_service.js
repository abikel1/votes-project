const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch'); // אם Node <18: npm install node-fetch
const User = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';


// function generateToken(userId) {
//     return jwt.sign({ sub: userId.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
// }
function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// מחזיר רשימת כתובות לפי חיפוש ZIP או רחוב


async function register({ firstName, lastName, email, phone, city, address, password }) {
    // בדיקה אם המייל כבר קיים
    const exists = await User.findOne({ email });
    if (exists) throw Object.assign(new Error('המייל קיים כבר'), { status: 409 });

    // הצפנת סיסמה
    const passwordHash = await bcrypt.hash(password, 12);
// <<<<<<< HEAD
//     const user = await User.create({
//         name, email, address, phone, passwordHash,
//         joinedGroups: [], createdGroups: [], voteHistory: []
//     });
// =======
// >>>>>>> a1c83c8d2145ebf88aa769ba8d04af15a79010c3

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
    // const token = generateToken(user._id);
    const token = generateToken(user);

    const { passwordHash: _pwd, ...safe } = user.toObject();
    return { token, user: safe };
}


async function login({ email, password }) {
const user = await User.findOne({ email }).select('+passwordHash');
if (!user) throw { status: 404, errors: { email: 'אימייל לא קיים' } };

const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) throw { status: 401, errors: { password: 'סיסמה לא נכונה' } };

const token = generateToken(user);
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

// <<<<<<< HEAD
// ✅ חדש: שליפת יחיד
async function getUserById(id) {
    if (!id) return null;
    return User.findById(id, { passwordHash: 0 }).lean();
}

// ✅ חדש: batch לפי מזהים
async function getUsersBatch(ids = []) {
    const clean = Array.from(new Set(ids.filter(Boolean)));
    if (!clean.length) return {};
    const rows = await User.find({ _id: { $in: clean } }, { passwordHash: 0 }).lean();
    const map = {};
    rows.forEach(u => { map[String(u._id)] = u; });
    return map;
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
    register, login, getProfile, listUsers,
    getUserById, getUsersBatch,updateProfile

};
