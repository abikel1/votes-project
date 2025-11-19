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

// 1. CORS
// app.use(cors());

// 2. Static files for images
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Upload route — MUST come before express.json()
app.use('/api/upload', uploadRoutes);

// 4. JSON parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Google auth
app.use(passport.initialize());

// 6. Other routes
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/auth', authRoutes);

// Root test
app.get('/', (req, res) => res.send('API is running...'));

module.exports = app;
