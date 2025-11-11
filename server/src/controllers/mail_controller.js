const { sendMail, renderTemplate } = require('../services/mail_service');

exports.sendGenericMail = async (req, res, next) => {
  try {
    const { to, subject, text, html, template, vars, cc, bcc } = req.body;
    const finalHtml = template ? renderTemplate(template, vars) : html;
    const result = await sendMail({ to, subject, text, html: finalHtml, cc, bcc });
    return res.json({
      message: 'Email sent',
      messageId: result.messageId,
      previewUrl: result.previewUrl || undefined,
    });
  } catch (e) {
    console.error('sendGenericMail error:', e);     // <<< חשוב לדיבוג
    return res.status(500).json({ message: e.message || 'Send failed' });
  }
};
