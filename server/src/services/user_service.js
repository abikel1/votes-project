const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch'); // אם Node <18: npm install node-fetch
const User = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// CKAN API
const DATASTORE_URL = 'https://data.gov.il/api/3/action/datastore_search';
const RESOURCE_ID = 'a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3'; // משאב כתובות

function generateToken(userId) {
    return jwt.sign({ sub: userId.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// מחזיר רשימת כתובות לפי חיפוש ZIP או רחוב
async function fetchCityAddress(query) {
    try {
        const url = `${DATASTORE_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(query)}&limit=10`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch from CKAN API');

        const data = await response.json();
        // מחזיר רשימה של כתובות
        return data.result.records.map(r => ({
            city: r.city || r.CITY || '',
            street: r.street || r.STREET || '',
            zip: r.zip || r.ZIP || ''
        }));
    } catch (err) {
        console.error('CKAN fetch error:', err.message);
        return [];
    }
}

async function register({ firstName, lastName, email, phone, zip, address, password }) {
    const exists = await User.findOne({ email });
    if (exists) throw Object.assign(new Error('המייל קיים כבר'), { status: 409 });

    let city = '';
    let street = address || '';

    if (zip || address) {
        const results = await fetchCityAddress(zip || address);
        if (results.length > 0) {
            city = results[0].city;           // אפשר לשנות ל-results כדי להחזיר רשימה בצד לקוח
            street = street || results[0].street;
        }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        city,
        address: street,
        passwordHash,
        joinedGroups: [],
        createdGroups: [],
        voteHistory: []
    });

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
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'address', 'password', 'zip'];
    const dataToUpdate = {};

    for (let key of allowedFields) {
        if (updates[key] !== undefined) {
            if (key === 'password') {
                dataToUpdate.passwordHash = await bcrypt.hash(updates.password, 12);
            } else if (key === 'zip') {
                // מחפש כתובות לפי ZIP ומעדכן city/address
                const results = await fetchCityAddress(updates.zip);
                if (results.length > 0) {
                    dataToUpdate.city = results[0].city;
                    dataToUpdate.address = updates.address || results[0].street;
                }
            } else {
                dataToUpdate[key] = updates[key];
            }
        }
    }

    const user = await User.findByIdAndUpdate(userId, dataToUpdate, { new: true }).select('-passwordHash');
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

    return user;
}

// פונקציה שמחזירה רק את רשימת הכתובות (ל‑dropdown בצד לקוח)
async function getAddressSuggestions(query) {
    return await fetchCityAddress(query);
}

module.exports = {
    register,
    login,
    getProfile,
    listUsers,
    updateProfile,
    getAddressSuggestions // ← קריאה נפרדת לצורך autocomplete
};
