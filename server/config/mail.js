const nodemailer = require('nodemailer');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;
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

  const { SMTP_HOST, SMTP_PORT = '587', SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP config missing. Use SMTP_HOST=ethereal for dev or provide SMTP_HOST/SMTP_USER/SMTP_PASS');
  }

  const secure = String(SMTP_PORT) === '465';

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure,
    requireTLS: !secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { minVersion: 'TLSv1.2' },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    logger: true,
    debug: true,
  });

  return transporter;
}

module.exports = { getTransporter };
