// // src/pages/Login/LoginPage.jsx
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { login, loginSuccess } from '../../slices/authSlice';
// import { useNavigate, useLocation, Link } from 'react-router-dom';
// import '../Register/RegisterPage.css';

// export default function LoginPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { loading } = useSelector(s => s.auth);

//   const [form, setForm] = useState({ email: '', password: '' });
//   const [errors, setErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);

//   const params = new URLSearchParams(location.search);
//   const redirect = params.get('redirect');
//   const expired = params.get('expired');   // 👈 אם יש expired=1 ב־URL
//   const fallbackAfterLogin = '/groups';

//   const handleFocus = (field) =>
//     setErrors(prev => ({ ...prev, [field]: null }));

//   const validateForm = () => {
//     const newErrors = {};
//     if (!form.email.trim()) newErrors.email = 'אימייל*';
//     if (!form.password) newErrors.password = 'סיסמה*';
//     return newErrors;
//   };

//   // ✅ חזרה מגוגל עם token+email → לשמור ולהתחבר
//   useEffect(() => {
//     const token = params.get('token');
//     const email = params.get('email');

//     if (token && email) {
//       dispatch(loginSuccess({ token, user: { email } }));
//       navigate(
//         redirect ? decodeURIComponent(redirect) : fallbackAfterLogin,
//         { replace: true }
//       );
//     }
//   }, [params, dispatch, navigate, redirect]);

//   const submit = async (e) => {
//     e.preventDefault();
//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length) {
//       setErrors(validationErrors);
//       return;
//     }
//     setErrors({});

//     try {
//       await dispatch(login(form)).unwrap();
//       navigate(
//         redirect ? decodeURIComponent(redirect) : fallbackAfterLogin
//       );
//     } catch (err) {
//       setErrors(err || { form: 'אירעה שגיאה' });
//     }
//   };

//   const renderField = (placeholder, field, type = 'text') => (
//     <div
//       className="control block-cube block-input"
//       style={{ position: 'relative', marginBottom: '24px' }}
//     >
//       <input
//         type={field === 'password'
//           ? (showPassword ? 'text' : 'password')
//           : type}
//         placeholder={placeholder}
//         value={form[field]}
//         onChange={e =>
//           setForm(f => ({ ...f, [field]: e.target.value }))
//         }
//         onFocus={() => handleFocus(field)}
//       />
//       {errors[field] && (
//         <span className="msg error">{errors[field]}</span>
//       )}

//       {field === 'password' && (
//         <button
//           type="button"
//           className="eye-btn"
//           onClick={() => setShowPassword(prev => !prev)}
//           aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
//         >
//           {showPassword ? (
//             <svg width="22" height="22" viewBox="0 0 24 24">
//               <path d="M12 5c-5.5 0-9.5 4.5-10 7 .5 2.5 4.5 7 10 7s9.5-4.5 10-7c-.5-2.5-4.5-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
//               <circle cx="12" cy="12" r="2.5" />
//             </svg>
//           ) : (
//             <svg width="22" height="22" viewBox="0 0 24 24">
//               <path d="M2 5.27 3.28 4 20 20.72 18.73 22l-2.63-2.63A12.5 12.5 0 0 1 12 19C6.5 19 2.5 14.5 2 12c.2-1 1-2.5 2.37-4.06L2 5.27zM12 5c5.5 0 9.5 4.5 10 7-.13.63-.58 1.6-1.36 2.67L18.3 13.3A5 5 0 0 0 12 7c-.65 0-1.27.12-1.84.33L8.46 5.63C9.55 5.2 10.74 5 12 5z" />
//             </svg>
//           )}
//         </button>
//       )}

//       <div className="bg-top"><div className="bg-inner" /></div>
//       <div className="bg-right"><div className="bg-inner" /></div>
//       <div className="bg"><div className="bg-inner" /></div>
//     </div>
//   );

//   const googleHref = (() => {
//     const base = 'http://localhost:3000/api/users/google';
//     // redirect כבר מקודד מה-URL (/login?redirect=...)
//     // אין צורך לקודד שוב, פשוט מעבירים אותו כמו שהוא
//     return redirect ? `${base}?redirect=${redirect}` : base;
//   })();

//   return (
//     <div className="form-container">
//       <form className="form" autoComplete="off" onSubmit={submit}>
//         <h1>התחברות</h1>

//         {/* הודעת פג תוקף */}
//         {expired && (
//           <div className="top-msg error">
//             פג תוקף ההתחברות, יש להתחבר שוב.
//           </div>
//         )}

//         {/* שגיאה כללית מהשרת */}
//         {errors.form && (
//           <div className="top-msg error">{errors.form}</div>
//         )}

//         {renderField('אימייל', 'email', 'email')}
//         {renderField('סיסמה', 'password', 'password')}

//         <button
//           type="submit"
//           className="btn block-cube block-cube-hover"
//           disabled={loading}
//         >
//           <div className="bg-top"><div className="bg-inner" /></div>
//           <div className="bg-right"><div className="bg-inner" /></div>
//           <div className="bg"><div className="bg-inner" /></div>
//           <span className="text">{loading ? '...' : 'התחבר'}</span>
//         </button>

//         <a href={googleHref}>
//           <button
//             type="button"
//             className="btn google-btn"
//           >
//             התחבר עם Google
//           </button>
//         </a>

//         <Link to="/forgot-password" className="btn google-btn">
//           שכחתי סיסמה?
//         </Link>

//         <div
//           className="bottom-cta"
//           style={{ marginTop: 16, textAlign: 'center' }}
//         >
//           <span>עדיין לא נרשמת? </span>
//           <Link to="/register" className="register-link">
//             הירשם
//           </Link>
//         </div>
//       </form>
//     </div>
//   );
// }































import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginSuccess } from '../../slices/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../Register/RegisterPage.css'

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector(s => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const expired = params.get('expired');
  const fallbackAfterLogin = '/';

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'אימייל נדרש';
    if (!form.password) newErrors.password = 'סיסמה נדרשת';
    return newErrors;
  };

  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
      dispatch(loginSuccess({ token, user: { email } }));
      navigate(
        redirect ? decodeURIComponent(redirect) : fallbackAfterLogin,
        { replace: true }
      );
    }
  }, [params, dispatch, navigate, redirect]);

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
      navigate(
        redirect ? decodeURIComponent(redirect) : fallbackAfterLogin
      );
    } catch (err) {
      setErrors(err || { form: 'אירעה שגיאה' });
    }
  };

  const googleHref = (() => {
    const base = 'http://localhost:3000/api/users/google';
    return redirect ? `${base}?redirect=${redirect}` : base;
  })();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>התחברות</h1>
          <p>ברוכים השבים! נעים לראות אתכם שוב</p>
        </div>

        {expired && (
          <div className="alert alert-error">
            פג תוקף ההתחברות, יש להתחבר שוב
          </div>
        )}

        {errors.form && (
          <div className="alert alert-error">{errors.form}</div>
        )}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              onFocus={() => setErrors(prev => ({ ...prev, email: null }))}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="הכנס סיסמה"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                onFocus={() => setErrors(prev => ({ ...prev, password: null }))}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
              >
                {showPassword ? (
                  // 😎 עין פתוחה – הסיסמה מוצגת
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                ) : (
                  // 👁️ עין סגורה – הסיסמה מוסתרת
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>

            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <Link
            to="/forgot-password"
            className="forgot-link"
            onClick={() => setErrors({})} // ← מנקה את ה-state
          >
            שכחת סיסמה?
          </Link>


          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>

          <div className="divider">
            <span>או</span>
          </div>

          <a href={googleHref} className="btn btn-google">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            המשך עם Google
          </a>
        </form>

        <div className="auth-footer">
          <span>עדיין לא נרשמת? </span>
          <Link to="/register">הירשם עכשיו</Link>
        </div>
      </div>
    </div>
  );
}