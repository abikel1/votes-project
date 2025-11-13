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
        if (!email) return done(null, false, { reason: 'missing_email' });

        const user = await User.findOne({ email }).lean();

        // 1) לא קיים בכלל → שליחה להרשמה עם אימייל ממולא
        if (!user) {
          return done(null, false, { reason: 'new_user', prefill: { email } });
        }

        // 2) קיים אבל “חשבון לא הושלם” (נוצר אוטומטית בעבר)
        const isIncomplete =
          user.passwordHash === 'google_oauth' ||
          !user.firstName || !user.lastName; // אפשר להרחיב תנאים אם תרצי

        if (isIncomplete) {
          return done(null, false, {
            reason: 'incomplete',
            prefill: { email, firstName: user.firstName || '', lastName: user.lastName || '' },
          });
        }

        // 3) קיים ומלא → כניסה רגילה
        const token = jwt.sign(
          {
            sub: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return done(null, { existing: true, token, user });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
