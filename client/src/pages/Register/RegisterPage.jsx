// client/src/pages/Register/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../slices/authSlice';
import './RegisterPage.css';
import CityStreetAuto from '../../components/CityStreetAuto';

/** קומפוננטת עטיפה לשדה – מציגה שגיאה מעל הקובייה */
const FormRow = ({ error, children }) => (
  <div className={`form-row ${error ? 'has-error' : ''}`}>
    {error && <div className="field-error-above" role="alert">{error}</div>}
    {children}
  </div>
);

/** קוביית אינפוט רגילה */
const InputField = ({ placeholder, value, onChange, error, type = 'text', onFocus }) => (
  <FormRow error={error}>
    <div className="control block-cube block-input" style={{ position: 'relative' }}>
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
  </FormRow>
);

/** קוביית סיסמה עם “עין” בצד שמאל */
const PasswordField = ({ placeholder, value, onChange, error, autoComplete = 'new-password' }) => {
  const [show, setShow] = useState(false);
  return (
    <FormRow error={error}>
      {/* הודעת השגיאה מוצגת ע"י FormRow מעל הקובייה */}
      <div className="control block-cube block-input password-field" style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
        />

        {/* כפתור העין בצד שמאל */}
        <button
          type="button"
          className="eye-btn"
          aria-label={show ? 'הסתר סיסמה' : 'הצג סיסמה'}
          onClick={() => setShow(s => !s)}
        >
          {show ? (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5c-5.5 0-9.5 4.5-10 7 .5 2.5 4.5 7 10 7s9.5-4.5 10-7c-.5-2.5-4.5-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
              <circle cx="12" cy="12" r="2.5"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 5.27 3.28 4 20 20.72 18.73 22l-2.63-2.63A12.5 12.5 0 0 1 12 19C6.5 19 2.5 14.5 2 12c.2-1 1-2.5 2.37-4.06L2 5.27zM12 5c5.5 0 9.5 4.5 10 7-.13.63-.58 1.6-1.36 2.67L18.3 13.3A5 5 0 0 0 12 7c-.65 0-1.27.12-1.84.33L8.46 5.63C9.55 5.2 10.74 5 12 5z"/>
            </svg>
          )}
        </button>

        <div className="bg-top"><div className="bg-inner" /></div>
        <div className="bg-right"><div className="bg-inner" /></div>
        <div className="bg"><div className="bg-inner" /></div>
      </div>
    </FormRow>
  );
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate  = useNavigate();
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

  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.confirmPassword !== form.password;

  const submit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (form.firstName.trim().length < 2) newErrors.firstName = 'שם פרטי חייב לפחות 2 תווים';
    if (form.lastName.trim().length  < 2) newErrors.lastName  = 'שם משפחה חייב לפחות 2 תווים';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'אימייל לא תקין';
    if (form.password.length < 6) newErrors.password = 'סיסמה חייבת לפחות 6 תווים';
    if (form.phone && !/^[\d+\-\s()]{6,20}$/.test(form.phone)) newErrors.phone = 'טלפון לא תקין';
    if (!form.city)    newErrors.city    = 'עיר חובה';
    if (!form.address) newErrors.address = 'כתובת חובה';
    if (passwordsMismatch) newErrors.confirmPassword = 'הסיסמאות אינן תואמות';

    if (Object.keys(newErrors).length) return setErrors(newErrors);
    setErrors({});

    const { confirmPassword, ...payload } = form;
    dispatch(register(payload))
      .unwrap()
      .then(() => console.log('✅ Registered successfully'))
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || 'אירעה שגיאה ברישום';
        setErrors({ form: msg });
      });
  };

  useEffect(() => {
    if (registeredOk) {
      const t = setTimeout(() => navigate('/login'), 1500);
      return () => clearTimeout(t);
    }
  }, [registeredOk, navigate]);

  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={submit}>
        <h1>הרשמה</h1>

        {registeredOk && <div className="top-msg success">נרשמת בהצלחה!</div>}
        {errors.form && <div className="top-msg error">{errors.form}</div>}

        <InputField placeholder="*שם פרטי" value={form.firstName} onChange={(val) => setForm(f => ({ ...f, firstName: val }))} error={errors.firstName}/>
        <InputField placeholder="*שם משפחה" value={form.lastName} onChange={(val) => setForm(f => ({ ...f, lastName: val }))} error={errors.lastName}/>
        <InputField placeholder="*אימייל" type="email" value={form.email} onChange={(val) => setForm(f => ({ ...f, email: val }))} error={errors.email}/>

        <FormRow error={errors.city || errors.address}>
          <CityStreetAuto
            idPrefix="reg"
            className="citystreet--register"
            variant="blockCube"
            city={form.city}
            address={form.address}
            onCityChange={(val) => setForm(f => ({ ...f, city: val }))}
            onAddressChange={(val) => setForm(f => ({ ...f, address: val }))}
          />
        </FormRow>

        <InputField placeholder="*טלפון" value={form.phone} onChange={(val) => setForm(f => ({ ...f, phone: val }))} error={errors.phone}/>

        <PasswordField placeholder="*סיסמה" value={form.password} onChange={(val) => setForm(f => ({ ...f, password: val }))} error={errors.password}/>
        <PasswordField placeholder="*אימות סיסמה" value={form.confirmPassword} onChange={(val) => setForm(f => ({ ...f, confirmPassword: val }))} error={errors.confirmPassword || (passwordsMismatch ? 'הסיסמאות אינן תואמות' : '')}/>

        <button type="submit" className="btn block-cube block-cube-hover" disabled={loading || passwordsMismatch}>
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
          <span className="text">{loading ? '...' : 'צור חשבון'}</span>
        </button>
      </form>
    </div>
  );
}
