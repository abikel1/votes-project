import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../slices/authSlice';
import '../Register/RegisterPage.css';
import { useTranslation } from 'react-i18next';

const PasswordField = ({ label, placeholder, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="password-input">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={error ? 'error' : ''}
          minLength={6}
          required
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShow((s) => !s)}
          aria-label={
            show
              ? t('auth.reset.hidePassword')
              : t('auth.reset.showPassword')
          }
        >
          {show ? (
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
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default function ResetPasswordPage() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { loading, error, message } = useSelector((s) => s.auth);
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  const passwordsMismatch = confirm.length > 0 && confirm !== password;

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (password.length < 6)
      newErrors.password = t('auth.reset.passwordTooShort');
    if (passwordsMismatch)
      newErrors.confirm = t('auth.reset.passwordsMismatch');

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const action = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(action)) {
      setTimeout(() => nav('/login'), 2000);
    }
  };

  const disabled =
    loading || password.length < 6 || passwordsMismatch;

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
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                strokeWidth="2"
              />
              <path
                d="M9 12l2 2 4-4"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1>{t('auth.reset.title')}</h1>
          <p>{t('auth.reset.subtitle')}</p>
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

        {error && (
          <div className="alert alert-error">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          <PasswordField
            label={t('auth.reset.newPasswordLabel')}
            placeholder={t('auth.reset.newPasswordPlaceholder')}
            value={password}
            onChange={setPassword}
            error={errors.password}
          />

          <PasswordField
            label={t('auth.reset.confirmPasswordLabel')}
            placeholder={t('auth.reset.confirmPasswordPlaceholder')}
            value={confirm}
            onChange={setConfirm}
            error={
              errors.confirm ||
              (passwordsMismatch
                ? t('auth.reset.passwordsMismatch')
                : '')
            }
          />

          <div className="password-strength">
            {password.length > 0 && (
              <div className="strength-indicator">
                <div
                  className={`strength-bar ${password.length < 6
                      ? 'weak'
                      : password.length < 10
                        ? 'medium'
                        : 'strong'
                    }`}
                  style={{
                    width:
                      password.length < 6
                        ? '33%'
                        : password.length < 10
                          ? '66%'
                          : '100%',
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={disabled}
          >
            {loading
              ? t('auth.reset.submitting')
              : t('auth.reset.button')}
          </button>
        </form>
      </div>
    </div>
  );
}
