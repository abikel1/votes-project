
// server/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // גמיש בזיהוי מפתחות ה-ID והאימייל
    const userId =
      payload._id || payload.id || payload.userId || payload.uid || payload.user_id || payload.dbId || payload.sub || null;

    const email =
      payload.email || payload.user?.email || payload.emailAddress || payload.mail || payload.username || null;

    if (!userId || !email) {
      return res.status(401).json({ message: 'Invalid token payload (missing email/id)' });
    }

    // שולף את המשתמש לוודא שהוא קיים ב-DB
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // בונה את שם המשתמש משם פרטי ומשפחה
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    req.user = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: fullName, // נוח לשימוש מאוחד במקומות אחרים
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

