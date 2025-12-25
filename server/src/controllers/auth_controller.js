const { requestPasswordReset, resetPassword } = require('../services/password_reset_service');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
    await requestPasswordReset({ email, baseUrl, ip: req.ip });
    res.json({ message: 'אם המייל קיים, נשלחו הוראות לאיפוס.' });
  } catch (e) {
    console.error('forgotPassword error:', e);
    res.status(500).json({ message: 'Request failed' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password too short' });
    await resetPassword({ token, newPassword: password });
    res.json({ message: 'הסיסמה עודכנה בהצלחה.' });
  } catch (e) {
    console.error('resetPassword error:', e);
    res.status(400).json({ message: e.message || 'Reset failed' });
  }
};
