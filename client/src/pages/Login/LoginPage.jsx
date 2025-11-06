import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import '../Register/RegisterPage.css'; // ניתן להשתמש באותו CSS

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  // 🟢 פונקציה שמסתירה את השגיאה בזמן פוקוס
  const handleFocus = (field) => {
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  // 🟢 ולידציה מקומית
  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'אימייל*';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'אימייל לא תקין';

    if (!form.password) newErrors.password = 'סיסמה*';
    return newErrors;
  };

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const res = await dispatch(login(form));
    if (res.meta.requestStatus === 'fulfilled') navigate('/'); // 🟢 ניווט לדף הבית
  };

  // 🟢 יצירת שדה עם עיצוב קיים ושגיאה פנימית
  const renderField = (placeholder, field, type = 'text') => (
    <div className="control block-cube block-input" style={{ position: 'relative' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
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
          <h1>התחברות</h1>
        </div>

        {error && <div className="msg error">{error}</div>}

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
      </form>
    </div>
  );
}
