const express = require('express');
const router = express.Router();

const { sendGenericMail } = require('../controllers/mail_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const rateLimit = require('../middlewares/rate_limit_middleware');

router.post(
  '/send',
  rateLimit({ windowMs: 60_000, max: 3 }),
  sendGenericMail
);

module.exports = router;
