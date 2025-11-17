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

// ⬅️ חדש: רוט להעלאות
const uploadRoutes = require('./src/routes/upload_routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// ⬅️ סטטי לתמונות שהועלו
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);  // ⬅️ חדש

// Root check
app.get('/', (req, res) => res.send('API is running...'));

module.exports = app;
