const express = require('express');
const passport = require('passport');
require('../../config/google_auth');

const ctrl = require('../controllers/user_controller');
const auth = require('../middlewares/auth_middleware');
const { validate, schemas } = require('../middlewares/validate_middleware');

const router = express.Router();
const FRONT = process.env.FRONT_BASE || 'http://localhost:5173';

router.get('/google', (req, res, next) => {
  const state = req.query.redirect ? encodeURIComponent(req.query.redirect) : '';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
    session: false,
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${FRONT}/login?oauth=failed`);
    }
    const stateRedirect = req.query.state ? decodeURIComponent(req.query.state) : '';

    if (user && user.existing) {
      const { token, user: u } = user;
      const extra = stateRedirect ? `&redirect=${encodeURIComponent(stateRedirect)}` : '';
      return res.redirect(
        `${FRONT}/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(u.email)}${extra}`
      );
    }

    // משתמש לא קיים או חשבון לא הושלם → להפנות ל-/register עם אימייל ממולא
    const email = info?.prefill?.email || '';
    const firstName = info?.prefill?.firstName || '';
    const lastName = info?.prefill?.lastName || '';
    const qs = new URLSearchParams({
      email,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      from: info?.reason || 'google',
      ...(stateRedirect ? { redirect: stateRedirect } : {}),
    }).toString();

    return res.redirect(`${FRONT}/register?${qs}`);
  })(req, res, next);
});

router.post('/register', validate(schemas.register), ctrl.register);
router.post('/login', validate(schemas.login), ctrl.login);
router.get('/me', auth, ctrl.getProfile);
router.patch('/me', auth, ctrl.updateProfile);
router.get('/', ctrl.listUsers);
router.get('/batch', ctrl.getUsersBatch);
router.get('/:id', ctrl.getUserById);

module.exports = router;
