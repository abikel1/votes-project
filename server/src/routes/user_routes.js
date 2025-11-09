const express = require('express');
const ctrl = require('../controllers/user_controller');
const auth = require('../middlewares/auth_middleware');
const { validate, schemas } = require('../middlewares/validate_middleware');

const router = express.Router();

router.post('/register', validate(schemas.register), ctrl.register);
router.post('/login', validate(schemas.login), ctrl.login);
// <<<<<<< HEAD

// router.get('/me', auth, ctrl.getProfile);   // ✅ מתוקן

// // פתוח לציבור (אפשר להוסיף auth אם תרצי)
// =======
router.get('/me', auth, ctrl.getProfile);
router.patch('/me', auth, ctrl.updateProfile); // ← השתמש ב־ctrl
// >>>>>>> a1c83c8d2145ebf88aa769ba8d04af15a79010c3
router.get('/', ctrl.listUsers);

// ✅ חדש: batch ויחידני
router.get('/batch', ctrl.getUsersBatch);
router.get('/:id', ctrl.getUserById);

module.exports = router;
