// src/pages/Register/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { register } from '../../slices/authSlice';
import CityStreetAuto from '../../components/CityStreetAuto';
import './RegisterPage.css';
import { useTranslation } from 'react-i18next';

const InputField = ({ label, type = 'text', placeholder, value, onChange, onFocus, error }) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      className={error ? 'error' : ''}
    />
    {error && <span className="error-text">{error}</span>}
  </div>
);

const PasswordField = ({ label, placeholder, value, onChange, onFocus, error }) => {
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
          onFocus={onFocus}
          className={error ? 'error' : ''}
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShow(s => !s)}
          aria-label={show ? t('auth.reset.hidePassword') : t('auth.reset.showPassword')}
        >
          {show ? (
            // 👁️ עין פתוחה — סיסמה מוצגת
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
            </svg>
          ) : (
            // 👁️‍🗨️ עין סגורה — סיסמה מוסתרת
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, registeredOk } = useSelector(s => s.auth);
  const { t } = useTranslation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email') || '';
    const from = params.get('from') || '';
    if (email) {
      setForm(f => ({ ...f, email }));
    }
    if (email || from === 'google') {
      localStorage.removeItem('token');
    }
  }, [location.search]);

  useEffect(() => {
    if (form.confirmPassword && form.password && form.confirmPassword !== form.password) {
      setErrors(e => ({ ...e, confirmPassword: t('auth.register.errors.passwordsMismatch') }));
    } else {
      setErrors(e => ({ ...e, confirmPassword: undefined }));
    }
  }, [form.password, form.confirmPassword, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (form.firstName.trim().length < 2)
      newErrors.firstName = t('auth.register.errors.firstNameTooShort');
    if (form.lastName.trim().length < 2)
      newErrors.lastName = t('auth.register.errors.lastNameTooShort');
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = t('auth.register.errors.invalidEmail');
    if (form.password.length < 6)
      newErrors.password = t('auth.register.errors.passwordTooShort');
    if (form.phone && !/^[\d+\-\s()]{6,20}$/.test(form.phone))
      newErrors.phone = t('auth.register.errors.invalidPhone');
    if (!form.city) newErrors.city = t('auth.register.errors.cityRequired');
    if (!form.address) newErrors.address = t('auth.register.errors.addressRequired');
    if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = t('auth.register.errors.passwordsMismatch');

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const { confirmPassword, ...payload } = form;

    try {
      await dispatch(register(payload)).unwrap();
      const params = new URLSearchParams(location.search);
      const after = params.get('redirect');
      navigate(after ? decodeURIComponent(after) : '/login');
    } catch (err) {
      const apiErrors = {};
      if (err?.errors) {
        Object.keys(err.errors).forEach(key => {
          apiErrors[key] = err.errors[key];
        });
      } else if (err?.message) {
        apiErrors.form = err.message;
      } else {
        apiErrors.email = t('auth.register.errors.emailExists');
      }
      setErrors(apiErrors);
    }
  };

  useEffect(() => {
    if (registeredOk) {
      const tmr = setTimeout(() => {
        const params = new URLSearchParams(location.search);
        const after = params.get('redirect');
        navigate(after ? decodeURIComponent(after) : '/login');
      }, 1500);
      return () => clearTimeout(tmr);
    }
  }, [registeredOk, navigate, location.search]);

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>{t('auth.register.title')}</h1>
          <p>{t('auth.register.subtitle')}</p>
        </div>

        {registeredOk && (
          <div className="alert alert-success">
            {t('auth.register.successRedirect')}
          </div>
        )}

        {errors.form && (
          <div className="alert alert-error">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <InputField
              label={t('auth.register.firstNameLabel')}
              placeholder={t('auth.register.firstNamePlaceholder')}
              value={form.firstName}
              onChange={val => setForm(f => ({ ...f, firstName: val }))}
              onFocus={() => setErrors(e => ({ ...e, firstName: undefined }))}
              error={errors.firstName}
            />

            <InputField
              label={t('auth.register.lastNameLabel')}
              placeholder={t('auth.register.lastNamePlaceholder')}
              value={form.lastName}
              onChange={val => setForm(f => ({ ...f, lastName: val }))}
              onFocus={() => setErrors(e => ({ ...e, lastName: undefined }))}
              error={errors.lastName}
            />
          </div>

          <InputField
            label={t('auth.register.emailLabel')}
            type="email"
            placeholder={t('auth.register.emailPlaceholder')}
            value={form.email}
            onChange={val => setForm(f => ({ ...f, email: val }))}
            onFocus={() => setErrors(e => ({ ...e, email: undefined }))}
            error={errors.email}
          />

          <InputField
            label={t('auth.register.phoneLabel')}
            placeholder={t('auth.register.phonePlaceholder')}
            value={form.phone}
            onChange={val => setForm(f => ({ ...f, phone: val }))}
            onFocus={() => setErrors(e => ({ ...e, phone: undefined }))}
            error={errors.phone}
          />

          <div className="form-row">
            {/* עיר */}
            <div className="form-group">
              <label>{t('auth.register.cityLabel')}</label>
              <CityStreetAuto
                idPrefix="reg-city"
                className="citystreet--modern"
                city={form.city}
                onCityChange={(val) => {
                  setForm((f) => ({ ...f, city: val }));
                  setErrors((e) => ({ ...e, city: undefined }));
                }}
                cityInputProps={{ placeholder: t('auth.register.cityPlaceholder') }}
                onlyCity
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>

            {/* רחוב */}
            <div className="form-group">
              <label>{t('auth.register.streetLabel')}</label>
              <CityStreetAuto
                idPrefix="reg-street"
                className="citystreet--modern"
                city={form.city}
                address={form.address}
                onAddressChange={(val) => {
                  setForm((f) => ({ ...f, address: val }));
                  setErrors((e) => ({ ...e, address: undefined }));
                }}
                streetInputProps={{ placeholder: t('auth.register.streetPlaceholder') }}
                onlyStreet
              />
              {errors.address && (
                <span className="error-text">{errors.address}</span>
              )}
            </div>
          </div>

          <PasswordField
            label={t('auth.register.passwordLabel')}
            placeholder={t('auth.register.passwordPlaceholder')}
            value={form.password}
            onChange={val => setForm(f => ({ ...f, password: val }))}
            onFocus={() => setErrors(e => ({ ...e, password: undefined }))}
            error={errors.password}
          />

          <PasswordField
            label={t('auth.register.confirmPasswordLabel')}
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            value={form.confirmPassword}
            onChange={val => setForm(f => ({ ...f, confirmPassword: val }))}
            onFocus={() => setErrors(e => ({ ...e, confirmPassword: undefined }))}
            error={errors.confirmPassword}
          />

          {form.password.length > 0 && (
            <div className="password-strength">
              <div className="strength-indicator">
                <div
                  className={`strength-bar ${
                    form.password.length < 6 ? 'weak' :
                    form.password.length < 10 ? 'medium' : 'strong'
                  }`}
                  style={{
                    width: form.password.length < 6 ? '33%' :
                      form.password.length < 10 ? '66%' : '100%'
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || form.confirmPassword !== form.password}
          >
            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t('auth.register.alreadyHaveAccount')}</span>
          <Link to="/login">{t('auth.register.loginLink')}</Link>
        </div>
      </div>
    </div>
  );
}
