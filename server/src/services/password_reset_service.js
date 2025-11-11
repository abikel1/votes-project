const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/user_model');
const AuthToken = require('../models/auth_token_model');
const { sendMail, renderTemplate } = require('./mail_service');

function genTokenPair() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

async function requestPasswordReset({ email, baseUrl, ip }) {
  const user = await User.findOne({ email });
  // לא חושפים אם המייל קיים או לא
  if (!user) return;

  const { token, tokenHash } = genTokenPair();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות

  await AuthToken.create({
    userId: user._id,
    tokenHash,
    type: 'password_reset',
    expiresAt,
    createdByIP: ip,
  });

  const link = `${baseUrl}/reset-password/${token}`;
  const html = renderTemplate('resetPassword', { link, userName: user.firstName || user.name || '' });

  await sendMail({
    to: email,
    subject: 'איפוס סיסמה',
    html,
  });
}

async function resetPassword({ token, newPassword }) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const authToken = await AuthToken.findOne({
    tokenHash,
    type: 'password_reset',
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!authToken) throw new Error('Invalid or expired token');

  const user = await User.findById(authToken.userId);
  if (!user) throw new Error('User not found');

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  authToken.usedAt = new Date();
  await authToken.save();
  await AuthToken.updateMany(
    { userId: user._id, type: 'password_reset', usedAt: { $exists: false } },
    { $set: { usedAt: new Date() } }
  );

  return true;
}

module.exports = { requestPasswordReset, resetPassword };
