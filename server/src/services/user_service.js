const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const User = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: !!user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

async function register({ firstName, lastName, email, phone, city, address, password }) {
  const existing = await User.findOne({ email }).select('+passwordHash');

  if (existing) {
    if (existing.passwordHash) {
      throw { status: 409, errors: { email: 'המייל כבר קיים במערכת' } };
    }

    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.phone = phone;
    existing.city = city || '';
    existing.address = address;
    existing.passwordHash = await bcrypt.hash(password, 12);
    existing.authProvider = 'local';
    await existing.save();

    const token = generateToken(existing);
    const { passwordHash: _pwd, ...safe } = existing.toObject();
    return { token, user: safe };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    city: city || '',
    address,
    passwordHash,
    joinedGroups: [],
    createdGroups: [],
    voteHistory: [],
    authProvider: 'local',
  });

  const token = generateToken(user);
  const { passwordHash: _pwd, ...safe } = user.toObject();
  return { token, user: safe };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw { status: 404, errors: { email: 'EMAIL_NOT_FOUND' } };
  }

  if (!user.passwordHash) {
    throw { status: 401, errors: { password: 'INVALID_PASSWORD' } };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw { status: 401, errors: { password: 'INVALID_PASSWORD' } };
  }

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

async function getUserById(id) {
  if (!id) return null;
  return User.findById(id, { passwordHash: 0 }).lean();
}

async function getUsersBatch(ids = []) {
  const clean = Array.from(new Set(ids.filter(Boolean)));
  if (!clean.length) return {};
  const rows = await User.find(
    { _id: { $in: clean } },
    { passwordHash: 0 }
  ).lean();
  const map = {};
  rows.forEach(u => { map[String(u._id)] = u; });
  return map;
}

async function updateProfile(userId, updates) {
  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'address', 'password'];
  const dataToUpdate = {};

  if (updates.email !== undefined && updates.email !== null) {
    const trimmedEmail = updates.email.trim();
    if (trimmedEmail) {
      const existing = await User.findOne({
        email: trimmedEmail,
        _id: { $ne: userId },
      });

      if (existing) {
        const err = new Error('Email already exists');
        err.status = 409;
        err.errors = { email: 'המייל כבר קיים במערכת' };
        throw err;
      }

      dataToUpdate.email = trimmedEmail;
    }
  }

  for (let key of allowedFields) {
    if (key === 'email') continue;

    if (updates[key] !== undefined) {
      if (key === 'password') {
        dataToUpdate.passwordHash = await bcrypt.hash(updates.password, 12);
      } else {
        dataToUpdate[key] = updates[key];
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    dataToUpdate,
    { new: true }
  ).select('-passwordHash');

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return user;
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw { status: 404, errors: { form: 'User not found' } };
  }

  if (!user.passwordHash) {
    throw {
      status: 400,
      errors: { form: 'חשבון זה נוצר דרך google ולכן לא קיימת סיסמא' },
    };
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    throw { status: 401, errors: { currentPassword: 'הסיסמה הנוכחית שגויה' } };
  }

  if (!newPassword || newPassword.length < 6) {
    throw { status: 400, errors: { newPassword: 'סיסמה חייבת לפחות 6 תווים' } };
  }

  const same = await bcrypt.compare(newPassword, user.passwordHash);
  if (same) {
    throw {
      status: 400,
      errors: { newPassword: 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית' },
    };
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = newHash;
  await user.save();

  return true;
}

async function findOrCreateGoogleUser({ email, firstName, lastName }) {
  if (!email) {
    const err = new Error('Google account has no email');
    err.status = 400;
    throw err;
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      phone: '',
      city: '',
      address: '',
      passwordHash: null,
      authProvider: 'google',
      joinedGroups: [],
      createdGroups: [],
      voteHistory: [],
    });
  }

  const token = generateToken(user);
  const { passwordHash: _pwd, ...safe } = user.toObject();
  return { token, user: safe };
}

module.exports = {
  register,
  login,
  getProfile,
  listUsers,
  getUserById,
  getUsersBatch,
  updateProfile,
  changePassword,
  findOrCreateGoogleUser,
};
