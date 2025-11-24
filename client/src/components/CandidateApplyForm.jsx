import { useDispatch, useSelector } from 'react-redux';
import { applyCandidate, selectApplyingCandidate, selectApplyCandidateError } from '../slices/candidateSlice';
import { selectUserId } from '../slices/authSlice';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../pages/Register/RegisterPage.css';

export default function CandidateApplyForm({ groupId, candidateRequests = [] }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectApplyingCandidate);
  const error = useSelector(selectApplyCandidateError);

  // שולף את userId מה-Redux
  const userId = useSelector(selectUserId);
  console.log('[CandidateApplyForm] userId from Redux:', userId);

  const [form, setForm] = useState({ name: '', description: '', symbol: '', photoUrl: '' });
  const [userRequest, setUserRequest] = useState(null);
  const [localRequests, setLocalRequests] = useState(candidateRequests);

  useEffect(() => {
    console.log('[CandidateApplyForm] candidateRequests updated:', candidateRequests);
    // בודק אם המשתמש כבר הגיש בקשה
    const req = candidateRequests.find(
      req => req.userId && String(req.userId) === String(userId)
    );
    setUserRequest(req || null);
    setLocalRequests(candidateRequests);
  }, [candidateRequests, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    console.log('[CandidateApplyForm] form changed:', { ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[CandidateApplyForm] submitting form:', form);

    try {
      const newRequest = await dispatch(applyCandidate({ groupId, ...form })).unwrap();
      console.log('[CandidateApplyForm] request submitted successfully:', newRequest);
      toast.success('בקשת מועמדות הוגשה בהצלחה!');
      setForm({ name: '', description: '', symbol: '', photoUrl: '' });

      // מעדכן את הרשימה המקומית
      setLocalRequests(prev => [...prev, newRequest]);
      setUserRequest(newRequest);
    } catch (err) {
      console.error('[CandidateApplyForm] request failed:', err);
      const message = err?.message || 'שגיאה בלתי צפויה';
      toast.error(message);
    }
  };

  if (!groupId) {
    console.warn('[CandidateApplyForm] no groupId provided!');
    return <p>❌ אין ID של קבוצה. נסי לרענן את העמוד.</p>;
  }

  // --- הצגת סטטוס בקשה לפי סטטוס ---
  if (userRequest) {
    console.log('[CandidateApplyForm] userRequest found:', userRequest);
    if (userRequest.status === 'pending') {
      return (
        <div className="alert alert-info">
          📝 בקשת מועמדות שלך נמצאת בבדיקה אצל המנהל
        </div>
      );
    } else if (userRequest.status === 'approved') {
      return (
        <div className="alert alert-success">
          ✅ בקשת מועמדות שלך התקבלה
        </div>
      );
    }

  }


  return (
    <div className="auth-card register-card">
 {userRequest?.status === 'rejected' && (
      <div className="alert alert-warning">
        ⚠️ בקשתך נדחתה – ניתן להגיש בקשה שוב
      </div>
    )}

      <div className="auth-header">
        <h1>הגש מועמדות</h1>
        <p>מלאי את הפרטים למועמדות לקבוצה</p>
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

      <div style={{ marginTop: '1rem' }}>
        <strong>Local Requests Debug:</strong>
        <pre>{JSON.stringify(localRequests, null, 2)}</pre>
      </div>
    </div>
  );
}
