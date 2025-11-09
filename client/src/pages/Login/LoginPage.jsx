// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../slices/authSlice';
import { voteForCandidate } from '../../slices/votesSlice';
import '../Register/RegisterPage.css';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error } = useSelector(s => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleFocus = (field) => setErrors(prev => ({ ...prev, [field]: null }));

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'אימייל*';
    if (!form.password) newErrors.password = 'סיסמה*';
    return newErrors;
  };

  const submit = async (e) => {
    e.preventDefault();

    // ולידציה בסיסית לפני שליחה
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const res = await dispatch(login(form));

    if (res?.meta?.requestStatus === 'fulfilled') {
      // בדיקת state מהניווט הקודם (אם הגענו בגלל ניסיון הצבעה)
      const st = location.state;

      if (st?.action === 'vote' && st?.payload) {
        const { groupId, candidateId } = st.payload;

        try {
          await dispatch(voteForCandidate({ groupId, candidateId }));
        } catch {
          // לא חוסם ניווט, שגיאה תוצג מה־slice אם יש
        }

        // חזרה לכתובת המקור או לדף הקבוצה
        navigate(st.redirectTo || `/groups/${groupId}`, { replace: true });
      } else {
        // מקרה רגיל – חזרה לעמוד שממנו באנו (אם יש), אחרת לדף הבית
        navigate(st?.redirectTo || '/', { replace: true });
      }
    }
  };

  const renderField = (placeholder, field, type = 'text') => (
    <div className="control block-cube block-input" style={{ position: 'relative' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        onFocus={() => handleFocus(field)}
        autoComplete="off"
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
