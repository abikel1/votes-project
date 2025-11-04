const express = require('express');
const ctrl = require('../controllers/user_controller');
const auth = require('../middlewares/auth_middleware');
const { validate, schemas } = require('../middlewares/validate_middleware'); // אופציונלי

const router = express.Router();

// הרשמה
router.post('/register', validate(schemas.register), ctrl.register);

// התחברות
router.post('/login', validate(schemas.login), ctrl.login);

// פרופיל (ללא סיסמה)
router.get('/me', auth, ctrl.getProfile);

module.exports = router;
