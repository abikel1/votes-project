const { getTransporter } = require('../../config/mail');

async function sendMail({ to, subject, text, html, cc, bcc, attachments }) {
  if (!to || !subject) throw new Error('Missing to/subject');
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to, cc, bcc, subject, text, html, attachments
  });

  // אם עובדים עם Ethereal – נחזיר גם preview URL לנוחות
  let previewUrl = null;
  try {
    const nodemailer = require('nodemailer');
    if (transporter.options?.host?.includes('ethereal')) {
      previewUrl = nodemailer.getTestMessageUrl(info);
    }
  } catch (_) { }
  // 🔎 להדפסה במסוף כדי שתראי את הקישור למייל
  if (previewUrl) {
    console.log('Ethereal preview URL:', previewUrl);
  }

  return { messageId: info.messageId, previewUrl };
}

/** עוזר: בניית HTML פשוט מתבנית */
function renderTemplate(templateName, vars = {}) {
  // אפשר להחליף ל-handlebars/ejs בהמשך; בינתיים מינימלי:
  if (templateName === 'resetPassword') {
    const { link, userName = '' } = vars;
    return `
      <div style="font-family:Arial,sans-serif">
        <h3>שלום ${userName || ''}</h3>
        <p>לביצוע איפוס סיסמה לחצי על הקישור:</p>
        <p><a href="${link}">${link}</a></p>
        <p>הקישור תקף לזמן מוגבל.</p>
      </div>`;
  }
  // ברירת מחדל
  return vars.html || '';
}

module.exports = { sendMail, renderTemplate };
