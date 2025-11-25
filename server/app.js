// app.js (root)
const express = require('express');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./src/routes/user_routes');
const candidateRoutes = require('./src/routes/candidate_routes');
const groupRoutes = require('./src/routes/group_routes');
const voteRoutes = require('./src/routes/vote_routes');
const passport = require('./config/google_auth');
const mailRoutes = require('./src/routes/mail_routes');
const authRoutes = require('./src/routes/auth_routes');

const uploadRoutes = require('./src/routes/upload_routes');

const app = express();

// 1. CORS – חייב להיות לפני כל ה־routes
const allowedOrigins = [
  'http://localhost:5173',                 // פיתוח
  'https://votes-client-qoux.onrender.com', // ← כתובת ה־Client הנכונה!
  'https://votes-project.onrender.com',     // השרת עצמו
];

app.use(
  cors({
    origin(origin, callback) {
      // בקשות בלי Origin (Postman, Render health checks וכו') – נאפשר
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

// 2. Upload route (לפני JSON)
app.use('/api/upload', uploadRoutes);

// 3. JSON parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Google OAuth
app.use(passport.initialize());

// 5. All routes
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/auth', authRoutes);

// Root test
app.get('/', (req, res) => res.send('API is running...'));

module.exports = app;
