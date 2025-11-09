import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../slices/authSlice';
import './RegisterPage.css';

// קומפוננטת Input רגילה
const InputField = ({ placeholder, field, value, onChange, error, type = 'text', onFocus }) => (
  <div className="control block-cube block-input" style={{ position: 'relative' }}>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
    />
    <div className="bg-top"><div className="bg-inner" /></div>
    <div className="bg-right"><div className="bg-inner" /></div>
    <div className="bg"><div className="bg-inner" /></div>

    {error && (
      <span className="msg error" style={{
        position: 'absolute',
        top: '50%',
        left: '10px',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        fontSize: '0.85rem',
      }}>
        {error}
      </span>
    )}
  </div>
);


export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registeredOk } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  // שליחת טופס
  const submit = (e) => {
    e.preventDefault();
    // ולידציה בסיסית
    const newErrors = {};
    if (form.firstName.length < 2) newErrors.firstName = 'שם פרטי חייב לפחות 2 תווים';
    if (form.lastName.length < 2) newErrors.lastName = 'שם משפחה חייב לפחות 2 תווים';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'אימייל לא תקין';
    if (form.password.length < 6) newErrors.password = 'סיסמה חייבת לפחות 6 תווים';
    if (form.phone && !/^[\d+\-\s()]{6,20}$/.test(form.phone)) newErrors.phone = 'טלפון לא תקין';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    dispatch(register(form))
      .unwrap()
      .then(() => console.log('✅ Registered successfully'))
      .catch((err) => console.log('❌ Error registering:', err));
  };

  // autocomplete ערים
  useEffect(() => {
    if (form.city.length > 1) {
      fetch(`/api/users/address-suggestions?query=${encodeURIComponent(form.city)}`)
        .then(res => res.json())
        .then(data => setCitySuggestions(data))
        .catch(() => setCitySuggestions([]));
    } else {
      setCitySuggestions([]);
    }
  }, [form.city]);

  // autocomplete כתובות לפי עיר
  useEffect(() => {
    if (form.address.length > 1 && form.city) {
      fetch(`/api/users/address-suggestions?query=${encodeURIComponent(form.address)}&city=${encodeURIComponent(form.city)}`)
        .then(res => res.json())
        .then(data => setAddressSuggestions(data))
        .catch(() => setAddressSuggestions([]));
    } else {
      setAddressSuggestions([]);
    }
  }, [form.address, form.city]);

  // נווט לאחר רישום מוצלח
  useEffect(() => {
    if (registeredOk) {
      const timer = setTimeout(() => navigate('/login'), 1500);
      return () => clearTimeout(timer);
    }
  }, [registeredOk, navigate]);

  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={submit}>
        <h1>הרשמה</h1>

        {registeredOk && <div className="top-msg success">נרשמת בהצלחה!</div>}
        {error && <div className="top-msg error">{error}</div>}

        <InputField
          placeholder="*שם פרטי"
          field="firstName"
          value={form.firstName}
          onChange={(val) => setForm(f => ({ ...f, firstName: val }))}
          error={errors.firstName}
        />

        <InputField
          placeholder="*שם משפחה"
          field="lastName"
          value={form.lastName}
          onChange={(val) => setForm(f => ({ ...f, lastName: val }))}
          error={errors.lastName}
        />
  <InputField
          placeholder="*אימייל"
          field="email"
          type="email"
          value={form.email}
          onChange={(val) => setForm((f) => ({ ...f, email: val }))}
          onFocus={() => handleFocus('email')}
          error={errors.email}
        />
        <AutocompleteField
          placeholder="*עיר"
          value={form.city}
          onChange={(val) => setForm(f => ({ ...f, city: val }))}
          suggestions={citySuggestions}
          onSelect={(s) => setForm(f => ({ ...f, city: s.city, address: s.street }))}
          error={errors.city}
        />

        <AutocompleteField
          placeholder="כתובת"
          value={form.address}
          onChange={(val) => setForm(f => ({ ...f, address: val }))}
          suggestions={addressSuggestions}
          onSelect={(s) => setForm(f => ({ ...f, address: s.street }))}
          error={errors.address}
        />

        <InputField
          placeholder="*טלפון"
          field="phone"
          value={form.phone}
          onChange={(val) => setForm(f => ({ ...f, phone: val }))}
          error={errors.phone}
        />

        <InputField
          placeholder="*סיסמה"
          field="password"
          type="password"
          value={form.password}
          onChange={(val) => setForm(f => ({ ...f, password: val }))}
          error={errors.password}
        />

        <button type="submit" className="btn block-cube block-cube-hover" disabled={loading}>
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
          <span className="text">{loading ? '...' : 'צור חשבון'}</span>
        </button>
      </form>
    </div>
  );
}
