

const userService = require('../services/user_service');

// user_controller.js
exports.register = async (req, res) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.log('register error:', err);
    const errors = err.errors || { form: err.message || 'אירעה שגיאה ברישום' };
    res.status(err.status || 500).json({ errors });
  }
};



exports.login = async (req, res) => {
  try {
    const result = await userService.login(req.body);
    res.json(result);
  } catch (err) {
    console.log('--- Backend error ---');
    console.log('err.status:', err.status);
    console.log('err.errors:', err.errors);
    console.log('err.message:', err.message);
    
    const errors = err.errors || { form: err.message || 'אירעה שגיאה' };
    res.status(err.status || 500).json({ errors });
  }
};


exports.getProfile = async (req, res) => {
    try {
        // ✅ auth_middleware שם על req.user את {_id,email,name}
        const user = await userService.getProfile(req.user._id);
        res.json(user);
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

// ✅ חדש: עדכון פרופיל
exports.updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateProfile(req.user._id, req.body);
        res.json(updatedUser);
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

// ✅ חדש: שליפת כמה משתמשים במכה אחת
exports.getUsersBatch = async (req, res) => {
    try {
        const ids = String(req.query.ids || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        const map = await userService.getUsersBatch(ids);
        res.json(Object.values(map));
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
