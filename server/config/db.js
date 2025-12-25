import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user_model.js';

dotenv.config();

const DB_CONNECTION = process.env.MONGODB_URI;
if (!DB_CONNECTION) {
  console.error('Error: MONGODB_URI not defined in .env');
  process.exit(1);
}

export default async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_CONNECTION);
    console.log('✅ MongoDB connected');
    try {
      const col = mongoose.connection.db.collection('users');
      const indexes = await col.indexes();
      const hasOld = indexes.some(i => i.name === 'id_1');
      if (hasOld) {
        await col.dropIndex('id_1');
        console.log('🧹 Dropped old index: id_1');
      }
    } catch (e) {
      if (e.codeName !== 'NamespaceNotFound') {
        console.warn('Index cleanup warning:', e.message);
      }
    }
    try {
      await User.syncIndexes();
      console.log('🔄 User indexes synced');
    } catch (e) {
      console.warn('User.syncIndexes warning:', e.message);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}
