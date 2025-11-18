// client/src/pages/Reset/ResetPasswordPage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../slices/authSlice';
import '../Register/RegisterPage.css'; // להשתמש באותו עיצוב של ההרשמה

/** עטיפת שדה שמציגה שגיאה מעל הקובייה (כמו בהרשמה) */
const FormRow = ({ error, children }) => (
  <div className={`form-row ${error ? 'has-error' : ''}`}>
    {/* {error && <div className="field-error-above" role="alert">{error}</div>} */}
    {children}
  </div>
);

/** שדה סיסמה עם "עין" בצד שמאל (כמו בהרשמה) */
const PasswordField = ({ placeholder, value, onChange, error, autoComplete = 'new-password' }) => {
  const [show, setShow] = useState(false);
  return (
    <FormRow error={error}>
      <div className="control block-cube block-input password-field" style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          minLength={6}
          required
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

export default function ResetPasswordPage() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { loading, error, message } = useSelector((s) => s.auth);

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors, setErrors] = useState({});

  const passwordsMismatch = confirm.length > 0 && confirm !== password;

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (password.length < 6) newErrors.password = 'סיסמה חייבת לפחות 6 תווים';
    if (passwordsMismatch)  newErrors.confirm  = 'הסיסמאות אינן תואמות';
    if (Object.keys(newErrors).length) return setErrors(newErrors);
    setErrors({});

    const action = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(action)) {
      nav('/login');
    }
  };

  const disabled = loading || password.length < 6 || passwordsMismatch;

  return (
    <div className="form-container">
      <form className="form" autoComplete="off" onSubmit={submit}>
        <h1>איפוס סיסמה</h1>

        {message && <div className="top-msg success">{message}</div>}
        {error &&   <div className="top-msg error">{error}</div>}

        <PasswordField
          placeholder="*סיסמה חדשה (מינימום 6 תווים)"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
        <PasswordField
          placeholder="*אימות סיסמה"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm || (passwordsMismatch ? 'הסיסמאות אינן תואמות' : '')}
        />

        <button type="submit" className="btn block-cube block-cube-hover" disabled={disabled}>
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
          <span className="text">{loading ? '...' : 'איפוס סיסמא'}</span>
        </button>
      </form>
    </div>
  );
}
