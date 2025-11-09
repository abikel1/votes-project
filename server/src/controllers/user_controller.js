const userService = require('../services/user_service');

exports.register = async (req, res) => {
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
        const user = await userService.getProfile(req.user._id);
        res.json(user);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await userService.listUsers();
        res.json(users);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateProfile(req.user._id, req.body);
        res.json(updatedUser);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

