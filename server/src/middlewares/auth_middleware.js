const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = async function auth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'Missing token' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = payload.sub;

        if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        req.user = { _id: user._id, email: user.email, name: user.name };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
