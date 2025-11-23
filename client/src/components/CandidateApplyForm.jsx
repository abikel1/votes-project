import { useDispatch, useSelector } from 'react-redux';
import { applyCandidate, selectApplyingCandidate, selectApplyCandidateError } from '../slices/candidateSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';
import '../pages/Register/RegisterPage.css'


export default function CandidateApplyForm({ groupId, candidateRequests = [] }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectApplyingCandidate);
  const error = useSelector(selectApplyCandidateError);

  const [form, setForm] = useState({ name: '', description: '', symbol: '', photoUrl: '' });
  const userId = localStorage.getItem('userId') || '';

  const existingRequest = candidateRequests.find(req => req.userId === userId);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(applyCandidate({ groupId, ...form })).unwrap();
      toast.success('בקשת מועמדות הוגשה בהצלחה!');
      setForm({ name: '', description: '', symbol: '', photoUrl: '' });
    } catch (err) {
      const message = err?.message || 'שגיאה בלתי צפויה';
      toast.error(message);
    }
  };

  if (!groupId) {
    return <p>❌ אין ID של קבוצה. נסי לרענן את העמוד.</p>;
  }

  if (existingRequest) {
    return (
      <div className="alert alert-success">
        📝 בקשת מועמדות שלך נמצאת בבדיקה על ידי המנהל
      </div>
    );
  }

  return (
    <div className="auth-card register-card">
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
    </div>
  );
}
