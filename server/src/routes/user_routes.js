const express = require('express');
const ctrl = require('../controllers/user_controller');
const auth = require('../middlewares/auth_middleware');
const { validate, schemas } = require('../middlewares/validate_middleware');
const passport = require('passport');
require('../../config/google_auth'); // קובץ שתיצור עוד רגע

const router = express.Router();

router.post('/register', validate(schemas.register), ctrl.register);
router.post('/login', validate(schemas.login), ctrl.login);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const { token, user } = req.user;
    // מחזירים טוקן כמו בהתחברות רגילה
    res.redirect(`http://localhost:5173/login?token=${token}&email=${user.email}`);
  }
);

router.get('/me', auth, ctrl.getProfile);
router.patch('/me', auth, ctrl.updateProfile); // ← השתמש ב־ctrl
router.get('/', ctrl.listUsers);

router.get('/batch', ctrl.getUsersBatch);
router.get('/:id', ctrl.getUserById);




module.exports = router;
