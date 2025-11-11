// server/src/routes/mail_routes.js
const express = require('express');
const router = express.Router();

const { sendGenericMail } = require('../controllers/mail_controller');

// שימי לב לייבוא נכון של ה־auth לפי איך ייצאת אותו (ראו סעיף 3):
// אם בקובץ האותנטיקציה עשית module.exports = async function (…) { … }
const authMiddleware = require('../middlewares/auth_middleware');

// אם עשית module.exports = { authMiddleware: async function (…) { … } }
// אז הייבוא צריך להיות:
// const { authMiddleware } = require('../middlewares/auth_middleware');

const rateLimit = require('../middlewares/rate_limit_middleware');

router.post(
  '/send',
  authMiddleware,
  rateLimit({ windowMs: 60_000, max: 3 }),
  sendGenericMail
);

module.exports = router;
