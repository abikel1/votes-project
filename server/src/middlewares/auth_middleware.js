const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = function auth(req, res, next) {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    try {
        req.user = jwt.verify(token, JWT_SECRET); // { sub, dbId, iat, exp }
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};
