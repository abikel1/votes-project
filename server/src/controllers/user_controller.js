// const userService = require('../services/user_service');

// exports.register = async (req, res) => {
//     console.log('REGISTER BODY:', req.body); // <--- לבדוק מה מגיע
//     try {
//         const result = await userService.register(req.body);
//         res.status(201).json(result);
//     } catch (err) {
// // <<<<<<< HEAD
//         res.status(err.status || 500).json({ message: err.message });
// // =======
// //         res.status(err.status || 500).json({ message: err.message || 'Server error' });
// // >>>>>>> a1c83c8d2145ebf88aa769ba8d04af15a79010c3
//     }
// };


// exports.login = async (req, res) => {
//     try {
//         const result = await userService.login(req.body);
//         res.json(result);
//     } catch (err) {
//         res.status(err.status || 500).json({ message: err.message || 'Server error' });
//     }
// };

// exports.getProfile = async (req, res) => {
//     try {
// <<<<<<< HEAD
//         // ✅ auth_middleware שם על req.user את {_id,email,name}
//         const data = await userService.getProfile(req.user._id);
//         res.json(data);
// =======
//         const user = await userService.getProfile(req.user._id);
//         res.json(user);
// >>>>>>> a1c83c8d2145ebf88aa769ba8d04af15a79010c3
//     } catch (err) {
//         res.status(err.status || 500).json({ message: err.message || 'Server error' });
//     }
// };

// exports.listUsers = async (_req, res) => {
//     try {
//         const users = await userService.listUsers();
//         res.json(users);
//     } catch (err) {
//         res.status(err.status || 500).json({ message: err.message || 'Server error' });
//     }
// };

// <<<<<<< HEAD
// // ✅ חדש: שליפת משתמש לפי id
// exports.getUserById = async (req, res) => {
//     try {
//         const u = await userService.getUserById(req.params.id);
//         if (!u) return res.status(404).json({ message: 'User not found' });
//         res.json(u);
//     } catch (err) {
//         res.status(500).json({ message: err.message || 'Server error' });
//     }
// };

// // ✅ חדש: batch ids=a,b,c
// exports.getUsersBatch = async (req, res) => {
//     try {
//         const ids = String(req.query.ids || '')
//             .split(',')
//             .map(s => s.trim())
//             .filter(Boolean);
//         const map = await userService.getUsersBatch(ids);
//         res.json(Object.values(map)); // אפשר גם להחזיר map; הלקוח מסתדר עם שניהם
//     } catch (err) {
//         res.status(500).json({ message: err.message || 'Server error' });
//     }
// };
// =======
// exports.updateProfile = async (req, res) => {
//     try {
//         const updatedUser = await userService.updateProfile(req.user._id, req.body);
//         res.json(updatedUser);
//     } catch (err) {
//         res.status(err.status || 500).json({ message: err.message || 'Server error' });
//     }
// };

// >>>>>>> a1c83c8d2145ebf88aa769ba8d04af15a79010c3


const userService = require('../services/user_service');

exports.register = async (req, res) => {
    console.log('BODY RECEIVED:', req.body);
    try {
        const result = await userService.register(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
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
