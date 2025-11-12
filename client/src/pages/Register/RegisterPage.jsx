import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../slices/authSlice';
import CityStreetAuto from '../../components/CityStreetAuto';
import './RegisterPage.css';

/* שדה רגיל */
const InputField = ({ placeholder, value, onChange, onFocus, error, type = 'text' }) => (
  <div className="form-row">
    {error && <div className="field-error-above">{error}</div>}
    <div className="control block-cube block-input">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoComplete="off"
        aria-invalid={!!error}
      />
      <div className="bg-top"><div className="bg-inner" /></div>
      <div className="bg-right"><div className="bg-inner" /></div>
      <div className="bg"><div className="bg-inner" /></div>
    </div>
  </div>
);

/* שדה סיסמה */
const PasswordField = ({ placeholder, value, onChange, onFocus, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-row">
      {error && <div className="field-error-above">{error}</div>}
      <div className="control block-cube block-input password-field">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          autoComplete="new-password"
          aria-invalid={!!error}
        />
        <button
          type="button"
          className="eye-btn"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'הסתר סיסמה' : 'הצג סיסמה'}
        >
          {show ? (
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M12 5c-5.5 0-9.5 4.5-10 7 .5 2.5 4.5 7 10 7s9.5-4.5 10-7c-.5-2.5-4.5-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M2 5.27 3.28 4 20 20.72 18.73 22l-2.63-2.63A12.5 12.5 0 0 1 12 19C6.5 19 2.5 14.5 2 12c.2-1 1-2.5 2.37-4.06L2 5.27zM12 5c5.5 0 9.5 4.5 10 7-.13.63-.58 1.6-1.36 2.67L18.3 13.3A5 5 0 0 0 12 7c-.65 0-1.27.12-1.84.33L8.46 5.63C9.55 5.2 10.74 5 12 5z"/>
            </svg>
          )}
        </button>
        <div className="bg-top"><div className="bg-inner" /></div>
        <div className="bg-right"><div className="bg-inner" /></div>
        <div className="bg"><div className="bg-inner" /></div>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, registeredOk } = useSelector((s) => s.auth);

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
  const passwordsMismatch = form.confirmPassword && form.confirmPassword !== form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form...', form);

    const newErrors = {};

    if (form.firstName.trim().length < 2) newErrors.firstName = 'שם פרטי חייב לפחות 2 תווים';
    if (form.lastName.trim().length < 2) newErrors.lastName = 'שם משפחה חייב לפחות 2 תווים';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'אימייל לא תקין';
    if (form.password.length < 6) newErrors.password = 'סיסמה חייבת לפחות 6 תווים';
    if (form.phone && !/^[\d+\-\s()]{6,20}$/.test(form.phone)) newErrors.phone = 'טלפון לא תקין';
    if (!form.city) newErrors.city = 'עיר חובה';
    if (!form.address) newErrors.address = 'כתובת חובה';
    if (passwordsMismatch) newErrors.confirmPassword = 'הסיסמאות אינן תואמות';

    if (Object.keys(newErrors).length) {
      console.log('Client-side validation errors:', newErrors);
      return setErrors(newErrors);
    }

    setErrors({});
    const { confirmPassword, ...payload } = form;

 try {
  const result = await dispatch(register(payload)).unwrap();
  console.log('Registration success:', result);
} catch (err) {
  console.log('Registration error from server:', err);

  const apiErrors = {};

  // אם השגיאות מגיעות מאובייקט errors רגיל
  if (err?.errors) {
    Object.keys(err.errors).forEach((key) => {
      apiErrors[key] = err.errors[key];
    });
  }
  // אם השגיאות מגיעות מהשרת דרך response.data
  else if (err?.response?.data) {
    const data = err.response.data;
    if (data.errors) {
      Object.keys(data.errors).forEach((key) => {
        apiErrors[key] = data.errors[key];
      });
    } else if (data.message) {
      apiErrors.form = data.message;
    }
  }
  // fallback לכל שגיאה אחרת
  else if (err?.message) apiErrors.form = err.message;
  else if (typeof err === 'string') apiErrors.form = err;
  else apiErrors.form = 'מייל זה כבר קיים במערכת';

  console.log('Mapped errors:', apiErrors);
  setErrors(apiErrors);
}

  };

  useEffect(() => {
    if (registeredOk) {
      const t = setTimeout(() => navigate('/login'), 1500);
      return () => clearTimeout(t);
    }
  }, [registeredOk, navigate]);

  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={handleSubmit}>
        <h1>הרשמה</h1>

        {registeredOk && <div className="top-msg success">נרשמת בהצלחה!</div>}
        {errors.form && <div className="top-msg error">{errors.form}</div>}

        <InputField
          placeholder="*שם פרטי"
          value={form.firstName}
          onChange={(val) => setForm((f) => ({ ...f, firstName: val }))}
          onFocus={() => setErrors((e) => ({ ...e, firstName: undefined }))}
          error={errors.firstName}
        />

        <InputField
          placeholder="*שם משפחה"
          value={form.lastName}
          onChange={(val) => setForm((f) => ({ ...f, lastName: val }))}
          onFocus={() => setErrors((e) => ({ ...e, lastName: undefined }))}
          error={errors.lastName}
        />

        <InputField
          placeholder="*אימייל"
          type="email"
          value={form.email}
          onChange={(val) => setForm((f) => ({ ...f, email: val }))}
          onFocus={() => setErrors((e) => ({ ...e, email: undefined }))}
          error={errors.email}
        />

        <InputField
          placeholder="*טלפון"
          value={form.phone}
          onChange={(val) => setForm((f) => ({ ...f, phone: val }))}
          onFocus={() => setErrors((e) => ({ ...e, phone: undefined }))}
          error={errors.phone}
        />

        <div className="form-row">
          {(errors.city || errors.address) && (
            <div className="field-error-above">{errors.city || errors.address}</div>
          )}
          <CityStreetAuto
            idPrefix="reg"
            className="citystreet--register"
            variant="blockCube"
            city={form.city}
            address={form.address}
            onCityChange={(val) => {
              setForm((f) => ({ ...f, city: val }));
              setErrors((e) => ({ ...e, city: undefined }));
            }}
            onAddressChange={(val) => {
              setForm((f) => ({ ...f, address: val }));
              setErrors((e) => ({ ...e, address: undefined }));
            }}
          />
        </div>

        <PasswordField
          placeholder="*סיסמה"
          value={form.password}
          onChange={(val) => setForm((f) => ({ ...f, password: val }))}
          onFocus={() => setErrors((e) => ({ ...e, password: undefined }))}
          error={errors.password}
        />

        <PasswordField
          placeholder="*אימות סיסמה"
          value={form.confirmPassword}
          onChange={(val) => setForm((f) => ({ ...f, confirmPassword: val }))}
          onFocus={() => setErrors((e) => ({ ...e, confirmPassword: undefined }))}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          className="btn block-cube block-cube-hover"
          disabled={loading || passwordsMismatch}
        >
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
          <span className="text">{loading ? '...' : 'צור חשבון'}</span>
        </button>
      </form>
    </div>
  );
}
