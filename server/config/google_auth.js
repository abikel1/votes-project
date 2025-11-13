// config/google_auth.js (או היכן שמוגדר ה-passport)
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../src/models/user_model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // לדוגמה: http://localhost:3000/api/users/google/callback
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || '';
        const firstName = profile.name?.givenName || '';
        const lastName = profile.name?.familyName || '';

        let user = await User.findOne({ email });

        // משתמש קיים → משלימים התחברות רגילה
        if (user) {
          const token = jwt.sign(
            { sub: user._id.toString(), email: user.email, firstName: user.firstName, lastName: user.lastName },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          return done(null, { existing: true, token, user });
        }

        // משתמש חדש → לא יוצרים—מפנים להרשמה עם פרה-פיל
        return done(null, {
          existing: false,
          prefill: { email, firstName, lastName }
        });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
