import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import '../Register/RegisterPage.css';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      await dispatch(login(form)).unwrap();
      navigate('/');
    } catch (err) {
      console.log('--- LoginPage catch ---');
      console.log('err:', err);

      // אם unwrap נזרק, err הוא האובייקט של השגיאה (כמו { password: 'סיסמה לא נכונה' })
      setErrors(err || { form: 'אירעה שגיאה' });
    }



  };



const renderField = (placeholder, field, type = 'text') => (
  <div className="control block-cube block-input" style={{ position: 'relative', marginBottom: '24px' }}>
    
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      onFocus={() => handleFocus(field)}
    />

    {errors[field] && (
      <span className="msg error">{errors[field]}</span>
    )}

    <div className="bg-top"><div className="bg-inner" /></div>
    <div className="bg-right"><div className="bg-inner" /></div>
    <div className="bg"><div className="bg-inner" /></div>
  </div>
);



  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={submit}>
        <div className="control">
          <h1>התחברות</h1>
        </div>

        {errors.form && <div className="top-msg error">{errors.form}</div>}
        {/* {errors[field] && <span className="msg error">{errors[field]}</span>} */}

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
