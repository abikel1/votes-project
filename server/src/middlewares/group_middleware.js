// server/src/middlewares/group_middleware.js

/**
 * Middleware לבדיקה או טיפול לפני שמוחקים קבוצה.
 * לדוגמה: לבדוק אם יש לקבוצה משתמשים תלויים, פוסטים וכו'.
 * כרגע — רק ממשיך הלאה בלי לשבור את השרת.
 */
module.exports = async function handleGroupDependencies(req, res, next) {
  try {
    console.log('[MIDDLEWARE] Checking group dependencies for group ID:', req.params.id);
    
    // 🧩 כאן בעתיד תוכלי להוסיף לוגיקה אמיתית,
    // כמו מחיקת פוסטים של הקבוצה או בדיקה שאין משתמשים פעילים בקבוצה.
    // לדוגמה:
    // await Post.deleteMany({ groupId: req.params.id });

    next(); // ממשיך למחיקה בפועל
  } catch (err) {
    console.error('❌ Error in handleGroupDependencies middleware:', err);
    res.status(500).json({ message: 'Error while checking group dependencies', error: err.message });
  }
};
