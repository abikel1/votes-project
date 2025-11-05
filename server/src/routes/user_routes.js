// server/src/routes/user_routes.js
const express = require('express');
const ctrl = require('../controllers/user_controller');
const auth = require('../middlewares/auth_middleware');
const { validate, schemas } = require('../middlewares/validate_middleware');

const router = express.Router();

// הרשמה
router.post('/register', validate(schemas.register), ctrl.register);

// התחברות
router.post('/login', validate(schemas.login), ctrl.login);

// פרופיל עצמי
router.get('/me', auth, ctrl.getProfile);

// ✅ רשימת משתמשים (רצוי להגן עם auth/role לפי הצורך)
router.get('/', ctrl.listUsers);

module.exports = router;
