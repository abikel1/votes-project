import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // 🟢 הוספה
import { register } from '../../slices/authSlice';
import './RegisterPage.css';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 🟢 הוספה
  const { loading, error, registeredOk } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});

  const handleFocus = (field) => {
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'שם מלא*';
    else if (form.name.length < 2) newErrors.name = 'שם חייב לפחות 2 תווים';

    if (!form.email.trim()) newErrors.email = 'אימייל*';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'אימייל לא תקין';

    if (!form.password) newErrors.password = 'סיסמה*';
    else if (form.password.length < 6) newErrors.password = 'סיסמה חייבת לפחות 6 תווים';

    if (form.phone && !/^[\d+\-\s()]{6,20}$/.test(form.phone))
      newErrors.phone = 'טלפון לא תקין';

    return newErrors;
  };

  const submit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    dispatch(register(form))
      .unwrap()
      .then(() => console.log('✅ Registered successfully'))
      .catch((err) => console.log('❌ Error registering:', err));
  };

  // 🟢 נווט לעמוד התחברות אחרי רישום
  useEffect(() => {
    if (registeredOk) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 1500); // 1.5 שניות כדי שהמשתמש יספיק לראות את ההודעה
      return () => clearTimeout(timer);
    }
  }, [registeredOk, navigate]);

  const renderField = (placeholder, field, type = 'text') => (
    <div className="control block-cube block-input" style={{ position: 'relative' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
        onFocus={() => handleFocus(field)}
      />
      <div className="bg-top"><div className="bg-inner" /></div>
      <div className="bg-right"><div className="bg-inner" /></div>
      <div className="bg"><div className="bg-inner" /></div>

      {errors[field] && (
        <span
          className="msg error"
          style={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '0.85rem',
          }}
        >
          {errors[field]}
        </span>
      )}
    </div>
  );

  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={submit}>
        <div className="control">
          <h1>הרשמה</h1>
        </div>

        {registeredOk && (
          <div className="msg success">נרשמת בהצלחה! עכשיו ננווט לעמוד ההתחברות...</div>
        )}
        {error && <div className="msg error">{error}</div>}

        {renderField('שם מלא', 'name')}
        {renderField('אימייל', 'email', 'email')}
        {renderField('סיסמה', 'password', 'password')}
        {renderField('כתובת', 'address')}
        {renderField('טלפון', 'phone')}

        <button
          type="submit"
          className="btn block-cube block-cube-hover"
          disabled={loading}
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
