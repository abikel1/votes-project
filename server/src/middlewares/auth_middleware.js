const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * מוודא ש־req.user מכיל לפחות {_id, email, name}.
 * אם ב-JWT אין אימייל, נטען מה-DB לפי ה-id שב-claims.
 */
module.exports = async function auth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET); // { sub/dbId/id, email?, name? }

    let userId = payload.dbId || payload.sub || payload.id || null;
    let email = payload.email || null;
    let name = payload.name || null;

    if (!email && userId) {
      const u = await User.findById(userId).lean();
      if (!u) return res.status(401).json({ message: 'User not found' });
      email = u.email;
      name = name || u.name || null;
    }

    if (!userId || !email) {
      return res.status(401).json({ message: 'Invalid token payload (missing email/id)' });
    }

    req.user = { _id: userId, email, name };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
