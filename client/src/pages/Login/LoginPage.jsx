// בתוך LoginPage.jsx

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginSuccess } from '../../slices/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../Register/RegisterPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector(s => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const fallbackAfterLogin = '/groups';

  const handleFocus = (field) => setErrors(prev => ({ ...prev, [field]: null }));

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'אימייל*';
    if (!form.password) newErrors.password = 'סיסמה*';
    return newErrors;
  };

  // ✅ חזרה מ־OAuth עם token+email → להתחבר ולנווט
  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ token, user: { email } }));
      navigate(redirect ? decodeURIComponent(redirect) : fallbackAfterLogin, { replace: true });
    }
  }, [params, dispatch, navigate, redirect]);

  // ✅ פלבק: חזרנו מגוגל בלי token אבל עם email → להפנות להרשמה עם אימייל ממולא
  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');
    const from = params.get('from'); // במקרה שהשרת החזיר ?from=google
    if (!token && email && (from === 'google' || true)) {
      const extra = redirect ? `&redirect=${encodeURIComponent(redirect)}` : '';
      navigate(`/register?email=${encodeURIComponent(email)}${extra}`, { replace: true });
    }
  }, [params, navigate, redirect]);

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      await dispatch(login(form)).unwrap();
      navigate(redirect ? decodeURIComponent(redirect) : fallbackAfterLogin, { replace: true });
    } catch (err) {
      setErrors(err || { form: 'אירעה שגיאה' });
    }
  };

  const renderField = (placeholder, field, type = 'text') => (
    <div className="control block-cube block-input" style={{ position: 'relative', marginBottom: '24px' }}>
      <input
        type={field === 'password' ? (showPassword ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        onFocus={() => handleFocus(field)}
      />
      {errors[field] && <span className="msg error">{errors[field]}</span>}
      {field === 'password' && (
        <span className="password-toggle" onClick={() => setShowPassword(prev => !prev)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      )}
      <div className="bg-top"><div className="bg-inner" /></div>
      <div className="bg-right"><div className="bg-inner" /></div>
      <div className="bg"><div className="bg-inner" /></div>
    </div>
  );

  // ✅ קישור Google שומר redirect קדימה
  const googleHref = (() => {
    const base = 'http://localhost:3000/api/users/google';
    return redirect ? `${base}?redirect=${encodeURIComponent(redirect)}` : base;
  })();

  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={submit}>
        <h1>התחברות</h1>

        {errors.form && <div className="top-msg error">{errors.form}</div>}

        {renderField('אימייל', 'email', 'email')}
        {renderField('סיסמה', 'password', 'password')}

        <button type="submit" className="btn block-cube block-cube-hover" disabled={loading}>
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
          <span className="text">{loading ? '...' : 'התחבר'}</span>
        </button>

        {/* התחברות עם גוגל */}
        <a href={googleHref}>
          <button type="button" className="btn google-btn">התחבר עם Google</button>
        </a>

        <Link to="/forgot-password">שכחתי סיסמה?</Link>

        <div className="bottom-cta" style={{ marginTop: 16, textAlign: 'center' }}>
          <span>עדיין לא נרשמת? </span>
          <Link to="/register" className="register-link">הירשם</Link>
        </div>
      </form>
    </div>
  );
}
