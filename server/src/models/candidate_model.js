const mongoose = require('mongoose');

// סכימה למועמד
const candidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },    // מזהה ייחודי של המועמד
  groupId: { type: String, required: true },            // מזהה הקבוצה שאליה שייך המועמד
  name: { type: String, required: true },               // שם המועמד או המפלגה
  description: { type: String },                        // תיאור קצר או מצע
  photoUrl: { type: String },                            // קישור לתמונה / לוגו
  symbol: { type: String },                              // סימן קצר שמייצג את המועמד
  createdAt: { type: Date, default: Date.now },         // תאריך הוספת המועמד
  votesCount: { type: Number, default: 0 }             // מספר ההצבעות שקיבל
});

// יצירת המודל
const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
