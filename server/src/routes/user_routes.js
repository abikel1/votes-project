// routes/users_routes.js (או היכן שמוגדר router למשתמשים)
const express = require('express');
const passport = require('passport');
require('../../config/google_auth'); // ודאי שהנתיב נכון

const ctrl = require('../controllers/user_controller');
const auth = require('../middlewares/auth_middleware');
const { validate, schemas } = require('../middlewares/validate_middleware');

const router = express.Router();

// התחלת OAuth – מעבירים redirect בתוך state
router.get(
  '/google',
  (req, res, next) => {
    const state = req.query.redirect ? encodeURIComponent(req.query.redirect) : '';
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state,
      session: false,
    })(req, res, next);
  }
);

// החזרה מ-Google
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?oauth=failed' }),
  (req, res) => {
    const FRONT = process.env.FRONT_BASE || 'http://localhost:5173';
    const stateRedirect = req.query.state ? decodeURIComponent(req.query.state) : '';

    // משתמש קיים → כניסה רגילה
    if (req.user?.existing) {
      const { token, user } = req.user;
      const extra = stateRedirect ? `&redirect=${encodeURIComponent(stateRedirect)}` : '';
      return res.redirect(`${FRONT}/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}${extra}`);
    }

    // משתמש חדש → להפנות ל-Register עם שדות פרה-פיל
    const p = req.user?.prefill || {};
    const qs = new URLSearchParams({
      email: p.email || '',
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      from: 'google',
      ...(stateRedirect ? { redirect: stateRedirect } : {}),
    }).toString();

    return res.redirect(`${FRONT}/register?${qs}`);
  }
);

// שאר הנתיבים
router.post('/register', validate(schemas.register), ctrl.register);
router.post('/login', validate(schemas.login), ctrl.login);
router.get('/me', auth, ctrl.getProfile);
router.patch('/me', auth, ctrl.updateProfile);
router.get('/', ctrl.listUsers);
router.get('/batch', ctrl.getUsersBatch);
router.get('/:id', ctrl.getUserById);

module.exports = router;
