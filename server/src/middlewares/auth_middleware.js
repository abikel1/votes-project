// server/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = async function auth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const p = jwt.verify(token, JWT_SECRET);

    let userId =
      p._id || p.id || p.userId || p.uid || p.user_id || p.dbId || p.sub || null;

    let email =
      p.email || p.user?.email || p.emailAddress || p.mail || p.username || null;

    let name =
      p.name || p.user?.name || p.fullName || p.displayName || null;

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
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
