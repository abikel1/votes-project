import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset } from '../../slices/authSlice';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector(s => s.auth);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    dispatch(requestPasswordReset(email));
  };

  return (
    <div style={{maxWidth:480, margin:'3rem auto'}}>
      <h2>שכחתי סיסמה</h2>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="האימייל שלך"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />
        <button disabled={loading}>שלחי קישור איפוס</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
