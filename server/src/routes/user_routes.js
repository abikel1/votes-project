const express = require('express');
const ctrl = require('../controllers/user_controller');
const auth = require('../middlewares/auth_middleware');
const { validate, schemas } = require('../middlewares/validate_middleware');

const router = express.Router();

router.post('/register', validate(schemas.register), ctrl.register);
router.post('/login', validate(schemas.login), ctrl.login);
router.get('/me', auth, ctrl.getProfile);
router.patch('/me', auth, ctrl.updateProfile); // ← השתמש ב־ctrl
router.get('/', ctrl.listUsers);

module.exports = router;
