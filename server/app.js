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
const campaignRoutes = require('./src/routes/campaign_routes');

const app = express();

// ----------------------------------------------------------------------
// 1. CORS — חשוב מאוד! חייב להיות הדבר הראשון לפני כל ה־routes
// ----------------------------------------------------------------------
const allowedOrigins = [
    'http://localhost:5173',                  // Dev local
    'https://votes-client-qoux.onrender.com', // ה־frontend ברנדר
    'https://votes-project.onrender.com',     // ה־backend עצמו
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// ----------------------------------------------------------------------
// 2. Upload route — חשוב שיבוא לפני express.json()
// ----------------------------------------------------------------------
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('uploads'));

// ----------------------------------------------------------------------
// 3. JSON parser
// ----------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----------------------------------------------------------------------
// 4. Google OAuth
// ----------------------------------------------------------------------
app.use(passport.initialize());

// ----------------------------------------------------------------------
// 5. All API routes
// ----------------------------------------------------------------------
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

// Root test
app.get('/', (req, res) => res.send('API is running...'));

module.exports = app;
