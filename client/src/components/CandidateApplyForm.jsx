import { useDispatch, useSelector } from 'react-redux';
import { applyCandidate, selectApplyingCandidate, selectApplyCandidateError } from '../slices/candidateSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CandidateApplyForm({ groupId, candidateRequests = [] }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectApplyingCandidate);
  const error = useSelector(selectApplyCandidateError);

  const [form, setForm] = useState({ name: '', description: '', symbol: '', photoUrl: '' });

  const userId = localStorage.getItem('userId') || '';

  // בדיקה אם המשתמש כבר הגיש מועמדות
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
      <div className="candidate-requested">
        📝 בקשת מועמדות שלך נמצאת בבדיקה על ידי המנהל
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="שם" value={form.name} onChange={handleChange} required />
      <input name="symbol" placeholder="סימול" value={form.symbol} onChange={handleChange} />
      <textarea name="description" placeholder="תיאור קצר" value={form.description} onChange={handleChange} />
      <input name="photoUrl" placeholder="קישור לתמונה" value={form.photoUrl} onChange={handleChange} />
      <button type="submit" disabled={loading}>{loading ? 'טוען...' : 'הגש מועמדות'}</button>
      {error && <p className="err">❌ {error}</p>}
    </form>
  );
}
