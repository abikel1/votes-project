import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginSuccess } from '../../slices/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../Register/RegisterPage.css';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);
  const { t } = useTranslation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const expired = params.get('expired');
  const fallbackAfterLogin = '/';

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = t('auth.login.emailRequired');
    if (!form.password) newErrors.password = t('auth.login.passwordRequired');
    return newErrors;
  };

  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
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
      await dispatch(login(form)).unwrap();
      navigate(
        redirect ? decodeURIComponent(redirect) : fallbackAfterLogin
      );
    } catch (err) {
      setErrors(err || { form: t('common.genericError') });
    }
  };

  const googleHref = (() => {
    const base = 'http://localhost:3000/api/users/google';
    return redirect ? `${base}?redirect=${redirect}` : base;
  })();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('auth.login.title')}</h1>
          <p>{t('auth.login.subtitle')}</p>
        </div>

        {expired && (
          <div className="alert alert-error">
            {t('auth.login.expired')}
          </div>
        )}

        {errors.form && (
          <div className="alert alert-error">{errors.form}</div>
        )}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.login.emailLabel')}</label>
            <input
              id="email"
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              onFocus={() =>
                setErrors((prev) => ({ ...prev, email: null }))
              }
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {t('auth.login.passwordLabel')}
            </label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.login.passwordPlaceholder')}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                onFocus={() =>
                  setErrors((prev) => ({ ...prev, password: null }))
                }
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? t('auth.login.hidePassword')
                    : t('auth.login.showPassword')
                }
              >
                {showPassword ? (
                  // עין פתוחה – הסיסמה מוצגת
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  // עין סגורה – הסיסמה מוסתרת
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="1"
                      y1="1"
                      x2="23"
                      y2="23"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <Link
            to="/forgot-password"
            className="forgot-link"
            onClick={() => setErrors({})}
          >
            {t('auth.login.forgotLink')}
          </Link>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('auth.login.submitting') : t('auth.login.button')}
          </button>

          <div className="divider">
            <span>{t('common.or')}</span>
          </div>

          <a href={googleHref} className="btn btn-google">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('auth.login.google')}
          </a>
        </form>

        <div className="auth-footer">
          <span>{t('auth.login.noAccount')}</span>
          <Link to="/register">{t('auth.login.registerNow')}</Link>
        </div>
      </div>
    </div>
  );
}
