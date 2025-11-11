// server/config/mail.js
const nodemailer = require('nodemailer');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // DEV: Ethereal
  if ((process.env.SMTP_HOST || '').toLowerCase() === 'ethereal') {
    const testAcc = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAcc.user, pass: testAcc.pass },
      logger: true,
      debug: true,
    });
    return transporter;
  }

  // PROD: SMTP אמיתי
  const { SMTP_HOST, SMTP_PORT = '587', SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP config missing. Use SMTP_HOST=ethereal for dev or provide SMTP_HOST/SMTP_USER/SMTP_PASS');
  }

  // אם הפורט 465 → SSL מלא; אם 587 → STARTTLS
  const secure = String(SMTP_PORT) === '465';

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure,                 // 465=true, 587=false
    requireTLS: !secure,    // ב-587 נדרוש STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { minVersion: 'TLSv1.2' },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    logger: true,           // רישום מפורט למסוף
    debug: true,
  });

  return transporter;
}

module.exports = { getTransporter };
