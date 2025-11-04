// db.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/votes_project';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI, {
    autoIndex: true,
    maxPoolSize: 10,
  });
  console.log('✅ MongoDB connected');
}

module.exports = { connectDB };
