import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../slices/authSlice';
import './RegisterPage.css';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { loading, error, registeredOk } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  });

  const submit = (e) => {
    e.preventDefault();
    console.log('Submitting form:', form); // לבדיקה
    dispatch(register(form))
      .unwrap()
      .then(() => console.log('✅ Registered successfully'))
      .catch((err) => console.log('❌ Error registering:', err));
  };

  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={submit}>
        <div className="control">
          <h1>הרשמה</h1>
        </div>

        {registeredOk && (
          <div className="msg success">נרשמת בהצלחה! עכשיו התחברי.</div>
        )}
        {error && <div className="msg error">{error}</div>}

        <div className="control block-cube block-input">
          <input
            placeholder="שם מלא"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            value={form.name}
            required
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        <div className="control block-cube block-input">
          <input
            type="email"
            placeholder="אימייל"
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            value={form.email}
            required
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        <div className="control block-cube block-input">
          <input
            type="password"
            placeholder="סיסמה"
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            value={form.password}
            required
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        <div className="control block-cube block-input">
          <input
            placeholder="כתובת"
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            value={form.address}
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        <div className="control block-cube block-input">
          <input
            placeholder="טלפון"
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            value={form.phone}
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

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
