const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/user_routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Root check
app.get('/', (req, res) => res.send('API is running...'));

// Export the app for server.js
module.exports = app;
