import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import {
  applyCandidate,
  selectApplyingCandidate,
  selectApplyCandidateError,
} from '../slices/candidateSlice';

import { selectUserId } from '../slices/authSlice';
import '../pages/Register/RegisterPage.css';

export default function CandidateApplyForm({ groupId, candidateRequests = [] }) {
  const dispatch = useDispatch();

  const loading = useSelector(selectApplyingCandidate);
  const error = useSelector(selectApplyCandidateError);

  const userId = useSelector(selectUserId);
  const userEmail =
    useSelector((s) => s.auth.userEmail) ||
    localStorage.getItem('userEmail') ||
    '';

  const [form, setForm] = useState({
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
  });

  const [userRequest, setUserRequest] = useState(null);

  useEffect(() => {
    const emailNorm = (userEmail || '').trim().toLowerCase();

    const req = (candidateRequests || []).find((r) => {
      const rid = r.userId && String(r.userId);
      const remail = (r.email || '').trim().toLowerCase();
      return (
        (userId && rid && String(userId) === rid) ||
        (emailNorm && remail && emailNorm === remail)
      );
    });

    setUserRequest(req || null);
  }, [candidateRequests, userId, userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupId) {
      toast.error('קבוצה לא תקינה');
      return;
    }

    if (!form.name.trim()) {
      toast.error('שם מלא חובה');
      return;
    }

    try {
      const out = await dispatch(
        applyCandidate({
          groupId,
          name: form.name.trim(),
          description: form.description.trim(),
          symbol: form.symbol.trim(),
          photoUrl: form.photoUrl.trim(),
        })
      ).unwrap();

      if (out?.request) {
        setUserRequest(out.request);
      }

      toast.success('בקשת המועמדות הוגשה למנהל/ת הקבוצה!');
      setForm({ name: '', description: '', symbol: '', photoUrl: '' });
    } catch (err) {
      const message = err?.message || 'שגיאה בלתי צפויה';
      toast.error(message);
    }
  };

  if (!groupId) {
    return <p>❌ אין ID של קבוצה. נסי לרענן את העמוד.</p>;
  }

  if (!userId && !userEmail) {
    return (
      <div className="alert alert-info">
        כדי להגיש מועמדות יש להתחבר למערכת.
      </div>
    );
  }

  // 🔒 סטטוסים שחוסמים את הצגת הטופס
  if (userRequest) {
    if (userRequest.status === 'pending') {
      return (
        <div className="alert alert-info">
          📝 בקשת המועמדות שלך נמצאת בבדיקה אצל המנהל/ת
        </div>
      );
    }

    if (userRequest.status === 'approved') {
      return (
        <div className="alert alert-success">
          ✅ בקשת המועמדות שלך אושרה. את/ה כבר מועמד/ת בקבוצה זו.
        </div>
      );
    }
  }

  return (
    <div className="auth-card register-card">
      {/* ❌ נדחה */}
      {userRequest?.status === 'rejected' && (
        <div className="alert alert-warning">
          ⚠️ בקשת המועמדות שלך נדחתה – ניתן להגיש בקשה חדשה
        </div>
      )}

      {/* 🗑️ נמחק */}
      {userRequest?.status === 'removed' && (
        <div className="alert alert-warning">
          ⚠️ המועמדות הקודמת שלך נמחקה ע&quot;י המנהל/ת – ניתן להגיש בקשה חדשה
        </div>
      )}

      <div className="auth-header">
        <h1>הגש מועמדות</h1>
        <p>מלא/י את הפרטים למועמדות בקבוצה</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>שם מלא</label>
          <input
            type="text"
            name="name"
            placeholder="שם מלא"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>סימול</label>
          <input
            type="text"
            name="symbol"
            placeholder="סימול (אופציונלי)"
            value={form.symbol}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>תיאור קצר</label>
          <textarea
            name="description"
            placeholder="תיאור קצר עליך"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>קישור לתמונה</label>
          <input
            type="text"
            name="photoUrl"
            placeholder="https://..."
            value={form.photoUrl}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'טוען...' : 'הגש מועמדות'}
        </button>

        {error && <p className="error-text">❌ {error}</p>}
      </form>
    </div>
  );
}
