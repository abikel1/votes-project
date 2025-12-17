import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  requestPasswordReset,
  clearMessage,
  clearError,
} from '../../slices/authSlice';
import '../Register/RegisterPage.css';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  // const { loading, error, message } = useSelector((s) => s.auth);
  const { forgotLoading, error, message } = useSelector((s) => s.auth);
  const { t } = useTranslation();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    dispatch(requestPasswordReset(email));
  };

  useEffect(() => {
    // כשנכנסים לעמוד – מנקים הודעות ישנות
    dispatch(clearMessage());
    dispatch(clearError());
  }, [dispatch]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="icon-wrapper">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                strokeWidth="2"
              />
              <path
                d="M7 11V7a5 5 0 0 1 10 0v4"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h1>{t('auth.forgot.title')}</h1>
          <p>{t('auth.forgot.subtitle')}</p>
        </div>

        {message && (
          <div className="alert alert-success">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="22 4 12 14.01 9 11.01"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {message}
          </div>
        )}

        {error && typeof error === 'string' && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              {t('auth.forgot.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('auth.forgot.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
            {forgotLoading ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
          </button>

          {/* <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? t('auth.forgot.submitting')
              : t('auth.forgot.submit')}
          </button> */}
        </form>

        <div className="auth-footer">
          <Link to="/login" className="back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <line
                x1="19"
                y1="12"
                x2="5"
                y2="12"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="12 19 5 12 12 5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {t('auth.forgot.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
