// בתוך LoginPage.jsx

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginSuccess } from '../../slices/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../Register/RegisterPage.css';

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

  const handleFocus = (field) =>
    setErrors(prev => ({ ...prev, [field]: null }));

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'אימייל*';
    if (!form.password) newErrors.password = 'סיסמה*';
    return newErrors;
  };

  // ✅ חזרה מגוגל עם token+email → לשמור ולהתחבר
  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ token, user: { email } }));
      navigate(
        redirect ? decodeURIComponent(redirect) : fallbackAfterLogin,
        { replace: true }
      );
    }
  }, [params, dispatch, navigate, redirect]);

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
   const result = await dispatch(login(form)).unwrap(); 
    // ✅ כאן נוסיף עדכון של store עם המידע המוחזר
    // נניח שה־login מחזיר משהו כזה: { token, user }
    dispatch(loginSuccess(result)); 
          navigate(
        redirect ? decodeURIComponent(redirect) : fallbackAfterLogin
      );
    } catch (err) {
      setErrors(err || { form: 'אירעה שגיאה' });
    }
  };

  const renderField = (placeholder, field, type = 'text') => (
    <div
      className="control block-cube block-input"
      style={{ position: 'relative', marginBottom: '24px' }}
    >
      <input
        type={field === 'password'
          ? (showPassword ? 'text' : 'password')
          : type}
        placeholder={placeholder}
        value={form[field]}
        onChange={e =>
          setForm(f => ({ ...f, [field]: e.target.value }))
        }
        onFocus={() => handleFocus(field)}
      />
      {errors[field] && (
        <span className="msg error">{errors[field]}</span>
      )}

      {field === 'password' && (
        <button
          type="button"
          className="eye-btn"
          onClick={() => setShowPassword(prev => !prev)}
          aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
        >
          {showPassword ? (
            // מצב "מוצג" – כמו בהרשמה
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M12 5c-5.5 0-9.5 4.5-10 7 .5 2.5 4.5 7 10 7s9.5-4.5 10-7c-.5-2.5-4.5-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          ) : (
            // מצב "מוסתר" – כמו בהרשמה
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M2 5.27 3.28 4 20 20.72 18.73 22l-2.63-2.63A12.5 12.5 0 0 1 12 19C6.5 19 2.5 14.5 2 12c.2-1 1-2.5 2.37-4.06L2 5.27zM12 5c5.5 0 9.5 4.5 10 7-.13.63-.58 1.6-1.36 2.67L18.3 13.3A5 5 0 0 0 12 7c-.65 0-1.27.12-1.84.33L8.46 5.63C9.55 5.2 10.74 5 12 5z" />
            </svg>
          )}
        </button>
      )}

      <div className="bg-top"><div className="bg-inner" /></div>
      <div className="bg-right"><div className="bg-inner" /></div>
      <div className="bg"><div className="bg-inner" /></div>
    </div>
  );

  const googleHref = (() => {
    const base = 'http://localhost:3000/api/users/google';
    return redirect ? `${base}?redirect=${encodeURIComponent(redirect)}` : base;
  })();

  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={submit}>
        <h1>התחברות</h1>

        {errors.form && (
          <div className="top-msg error">{errors.form}</div>
        )}

        {renderField('אימייל', 'email', 'email')}
        {renderField('סיסמה', 'password', 'password')}

        <button
          type="submit"
          className="btn block-cube block-cube-hover"
          disabled={loading}
        >
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
          <span className="text">{loading ? '...' : 'התחבר'}</span>
        </button>

        <a href={googleHref}>
          <button
            type="button"
            className="btn google-btn"
          >
            התחבר עם Google
          </button>
        </a>

        <Link to="/forgot-password" className="btn google-btn">
          שכחתי סיסמה?
        </Link>

        <div
          className="bottom-cta"
          style={{ marginTop: 16, textAlign: 'center' }}
        >
          <span>עדיין לא נרשמת? </span>
          <Link to="/register" className="register-link">
            הירשם
          </Link>
        </div>
      </form>
    </div>
  );
}
