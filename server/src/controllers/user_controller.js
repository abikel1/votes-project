const userService = require('../services/user_service');

exports.register = async (req, res) => {
    try {
        const result = await userService.register(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await userService.login(req.body);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        // ✅ auth_middleware שם על req.user את {_id,email,name}
        const data = await userService.getProfile(req.user._id);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.listUsers = async (_req, res) => {
    try {
        const users = await userService.listUsers();
        res.json(users);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

// ✅ חדש: שליפת משתמש לפי id
exports.getUserById = async (req, res) => {
    try {
        const u = await userService.getUserById(req.params.id);
        if (!u) return res.status(404).json({ message: 'User not found' });
        res.json(u);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// ✅ חדש: batch ids=a,b,c
exports.getUsersBatch = async (req, res) => {
    try {
        const ids = String(req.query.ids || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        const map = await userService.getUsersBatch(ids);
        res.json(Object.values(map)); // אפשר גם להחזיר map; הלקוח מסתדר עם שניהם
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
