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
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // חיפוש אם המשתמש כבר קיים
        let user = await User.findOne({ email: profile.emails[0].value });

        // אם לא קיים - ניצור אותו
        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName || 'Unknown', // ← כאן משנה
            email: profile.emails[0].value,
            passwordHash: 'google_oauth', // לא באמת בשימוש
            joinedGroups: [],
            createdGroups: [],
            voteHistory: []
          });
        }

        const token = jwt.sign(
          { sub: user._id, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        done(null, { token, user });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
