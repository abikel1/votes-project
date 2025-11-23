import { useDispatch, useSelector } from 'react-redux';
import { applyCandidate, selectApplyingCandidate, selectApplyCandidateError } from '../slices/candidateSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CandidateApplyForm({ groupId }) {
      if (!groupId) {
    return <p>❌ אין ID של קבוצה. נסי לרענן את העמוד.</p>;
  }
  const dispatch = useDispatch();
  const loading = useSelector(selectApplyingCandidate);
  const error = useSelector(selectApplyCandidateError);

  const [form, setForm] = useState({ name: '', description: '', symbol: '', photoUrl: '' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(applyCandidate({ groupId, ...form })).unwrap();
      toast.success('בקשת מועמדות הוגשה בהצלחה!');
      setForm({ name: '', description: '', symbol: '', photoUrl: '' });
    } catch (err) {
      toast.error(err);
    }
  };

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
