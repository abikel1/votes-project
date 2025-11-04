// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // טוען את משתני הסביבה מ-.env

const DB_CONNECTION = process.env.MONGODB_URI;

if (!DB_CONNECTION) {
  console.error("Error: MONGODB_URI not defined in .env");
  process.exit(1);
}

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;