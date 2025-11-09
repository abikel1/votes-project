import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { voteForCandidate } from '../../slices/votesSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 כדי לקרוא את ה-state שהעבירו לנו
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login(form));

    if (res.meta.requestStatus === 'fulfilled') {
      // אם הגענו ללוגין בגלל ניסיון הצבעה
      const st = location.state;
      if (st?.action === 'vote' && st?.payload) {
        const { groupId, candidateId } = st.payload;

        // מצביעים מיד אחרי התחברות
        await dispatch(voteForCandidate({ groupId, candidateId }));

        // חוזרים למסך הקבוצה (או לכתובת שממנה באנו)
        navigate(st.redirectTo || `/groups/${groupId}`, { replace: true });
      } else {
        // מקרה רגיל: לא הגענו בגלל הצבעה
        navigate(st?.redirectTo || '/', { replace: true });
      }
    }
  };

  return (
    <div>
      <h3>התחברות</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={submit}>
        <input
          placeholder="Email"
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <button disabled={loading}>{loading ? '...' : 'Login'}</button>
      </form>
    </div>
  );
}
