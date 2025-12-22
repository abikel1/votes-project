// server/src/services/mail_service.js
const { getResend } = require('../../config/resend');

async function sendMail({ to, subject, text, html, cc, bcc, attachments, replyTo }) {
  if (!to || !subject) throw new Error('Missing to/subject');

  const resend = getResend();

  const payload = {
    from: process.env.MAIL_FROM || 'onboarding@resend.dev',
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
    replyTo: replyTo || process.env.MAIL_REPLY_TO,
  };

  if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
  if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];

  // Attachments (אופציונלי): Resend רוצה base64 + filename
  // if (attachments?.length) payload.attachments = ...

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(error.message || 'Resend send failed');
  }

  return { messageId: data?.id, previewUrl: null };
}

/** תבנית HTML – נשאר כמו אצלך */
function renderTemplate(templateName, vars = {}) {
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
  return vars.html || '';
}

module.exports = { sendMail, renderTemplate };
