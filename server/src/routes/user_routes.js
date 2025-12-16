const express = require('express');
const passport = require('passport');
require('../../config/google_auth');

const ctrl = require('../controllers/user_controller');
const auth = require('../middlewares/auth_middleware');
const { validate, schemas } = require('../middlewares/validate_middleware');

const router = express.Router();
const FRONT =
  process.env.CLIENT_BASE_URL || process.env.FRONT_BASE || 'http://localhost:5173';

router.get('/google', (req, res, next) => {
  const state = req.query.redirect ? encodeURIComponent(req.query.redirect) : '';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
    session: false,
  })(req, res, next);
});

/* ===== Google callback חדש ===== */
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, result, info) => {
    if (err || !result) {
      console.error('Google OAuth error:', err || info);
      return res.redirect(`${FRONT}/login?oauth=failed`);
    }

    const stateRedirect = req.query.state
      ? decodeURIComponent(req.query.state)
      : '';

    const { token, user } = result;
    const extra = stateRedirect
      ? `&redirect=${encodeURIComponent(stateRedirect)}`
      : '';

    return res.redirect(
      `${FRONT}/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(
        user.email
      )}${extra}`
    );
  })(req, res, next);
});

router.post('/register', validate(schemas.register), ctrl.register);
router.post('/login', validate(schemas.login), ctrl.login);
router.get('/me', auth, ctrl.getProfile);

router.patch(
  '/me',
  auth,
  validate(schemas.updateProfile),
  ctrl.updateProfile
);

router.post(
  '/me/password',
  auth,
  validate(schemas.changePassword),
  ctrl.changePassword
);

router.get('/', ctrl.listUsers);
router.get('/batch', ctrl.getUsersBatch);
router.get('/:id', ctrl.getUserById);

module.exports = router;
