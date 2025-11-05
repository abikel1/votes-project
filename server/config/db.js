// server/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// מודל המשתמש (CommonJS אצלך, אבל ESM יודע לייבא אותו כברירת מחדל)
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
    // מונגוס 7 – אין צורך ב-useNewUrlParser/useUnifiedTopology
    await mongoose.connect(DB_CONNECTION);
    console.log('✅ MongoDB connected');

    // 1) מוחק אינדקס ישן id_1 אם הוא קיים (זה מה שגורם ל-E11000 עם { id: null })
    try {
      const col = mongoose.connection.db.collection('users');
      const indexes = await col.indexes();
      const hasOld = indexes.some(i => i.name === 'id_1');
      if (hasOld) {
        await col.dropIndex('id_1');
        console.log('🧹 Dropped old index: id_1');
      }
    } catch (e) {
      // אם הקולקשן עוד לא קיים – לא קריטי
      if (e.codeName !== 'NamespaceNotFound') {
        console.warn('Index cleanup warning:', e.message);
      }
    }

    // 2) מסנכרן אינדקסים לפי הסכמה הנוכחית (email unique בלבד)
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
