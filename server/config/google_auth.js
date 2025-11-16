const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('../src/services/user_service');

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/users/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email     = profile.emails?.[0]?.value || '';
        const firstName = profile.name?.givenName || '';
        const lastName  = profile.name?.familyName || '';

        if (!email) {
          return done(null, false, { reason: 'missing_email' });
        }

        // 👇 זה עושה את כל הקסם: מחפש / יוצר יוזר, ומחזיר token + user
        const result = await userService.findOrCreateGoogleUser({
          email,
          firstName,
          lastName,
        });

        return done(null, result); // { token, user }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
