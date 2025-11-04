
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = '7d';

// POST /api/users/register
exports.register = async (req, res, next) => {
    try {
        const { id, name, email, address, phone, password } = req.body;

        if (!password) return res.status(400).json({ message: 'Password is required' });

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            id, name, email, address, phone, passwordHash,
            joinedGroups: [], createdGroups: [], voteHistory: [],
        });

        // החזרה ללא הסיסמה
        const { passwordHash: _pwd, ...safe } = user.toObject();
        res.status(201).json(safe);
    } catch (err) { next(err); }
};

// POST /api/users/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { sub: user.id, dbId: user._id.toString() },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        const { passwordHash: _pwd, ...safe } = user.toObject();
        res.json({ token, user: safe });
    } catch (err) { next(err); }
};

// GET /api/users/me
exports.getProfile = async (req, res, next) => {
    try {
        // req.user מגיע מהמידלוור (JWT)
        const user = await User.findOne({ id: req.user.sub }); // select:false מונע סיסמה
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) { next(err); }
};
