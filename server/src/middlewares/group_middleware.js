const Candidate = require('../models/candidate_model');
const Group = require('../models/group_model');
// אם יהיו בעתיד מודלים נוספים הקשורים לקבוצה, ניתן לייבא כאן

/**
 * Middleware לניהול פעולות תלויות בקבוצה.
 * כרגע מבצע מחיקה מקבילה של כל המועמדים של הקבוצה.
 */
async function handleGroupDependencies(req, res, next) {
  try {
    const groupId = req.params.id;

    // 1️⃣ מחיקת כל המועמדים של הקבוצה
    await Candidate.deleteMany({ groupId });

    // 2️⃣ ניתן להוסיף כאן פעולות נוספות, לדוגמה:
    // await Votes.deleteMany({ groupId });
    // await Participants.deleteMany({ groupId });

    console.log(`✅ All dependent objects of group ${groupId} deleted or handled.`);

    // ממשיכים לפונקציה הבאה בקונטרולר
    next();
  } catch (err) {
    console.error('❌ Error handling group dependencies:', err);
    res.status(500).json({ message: 'Error handling group dependencies', error: err.message });
  }
}

module.exports = handleGroupDependencies;
