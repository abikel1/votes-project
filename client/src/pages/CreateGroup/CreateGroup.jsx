import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup, clearCreateState } from '../../slices/groupsSlice';
import { useNavigate } from 'react-router-dom';
import './CreateGroup.css';

export default function CreateGroupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { createLoading, createError, justCreated, selectedGroup } = useSelector((s) => s.groups);

  const [form, setForm] = useState({
    name: '',
    description: '',
    endDate: '',
    maxWinners: 1,
    isLocked: null, // חובה לבחור
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (justCreated && selectedGroup?._id) setShowModal(true);
  }, [justCreated, selectedGroup]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'maxWinners' ? Number(value) : value,
    }));
  };

  const onChangeLock = (e) => {
    const v = e.target.value; // 'open' | 'locked'
    setForm((prev) => ({ ...prev, isLocked: v === 'locked' }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('שם קבוצה חובה');
    if (!form.endDate) return alert('תאריך סיום חובה');
    if (form.isLocked === null) return alert('בחרי אם הקבוצה פתוחה או נעולה');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      maxWinners: Number(form.maxWinners) || 1,
      isLocked: !!form.isLocked,
      endDate: new Date(form.endDate).toISOString(),
    };

    dispatch(createGroup(payload));
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); alert('הקישור הועתק'); }
    catch {}
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // קישור יחיד: פתוחה → /groups/:id ; נעולה → /join/:id
  const shareUrl = selectedGroup?._id
    ? `${origin}${selectedGroup.isLocked ? `/join/${selectedGroup._id}` : `/groups/${selectedGroup._id}`}`
    : '';

  const finishToGroup = () => {
    setShowModal(false);
    dispatch(clearCreateState());
    // מעבר לעמוד הקבוצה שנוצרה (גם אם נעולה – את היוצרת אז יש לך גישה)
    if (selectedGroup?._id) navigate(`/groups/${selectedGroup._id}`);
    else navigate('/groups');
  };

  return (
    <div className="cg-wrap">
      <h2 className="cg-title">יצירת קבוצה חדשה</h2>

      <form className="cg-form" onSubmit={onSubmit}>
        <label className="cg-label">
          שם קבוצה *
          <input className="cg-input" name="name" value={form.name} onChange={onChange} required />
        </label>

        <label className="cg-label">
          תיאור
          <textarea className="cg-input" rows={3} name="description" value={form.description} onChange={onChange} />
        </label>

        <label className="cg-label">
          תאריך סיום *
          <input className="cg-input" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
        </label>

        <label className="cg-label">
          מקסימום זוכים
          <input className="cg-input" type="number" min={1} name="maxWinners" value={form.maxWinners} onChange={onChange} />
        </label>

        <fieldset className="cg-fieldset">
          <legend className="cg-legend">מצב קבוצה *</legend>
          <div className="cg-radio-row">
            <label className="cg-radio">
              <input
                type="radio"
                name="lockState"
                value="open"
                checked={form.isLocked === false}
                onChange={onChangeLock}
                required
              />
              פתוחה (קישור לעמוד הקבוצה)
            </label>
            <label className="cg-radio" style={{ marginInlineStart: 16 }}>
              <input
                type="radio"
                name="lockState"
                value="locked"
                checked={form.isLocked === true}
                onChange={onChangeLock}
                required
              />
              🔒 נעולה (הקישור ידרוש התחברות לשם בקשת הצטרפות)
            </label>
          </div>
        </fieldset>

        {createError && <div className="cg-error">{createError}</div>}

        <div className="cg-actions">
          <button className="cg-btn" type="submit" disabled={createLoading}>
            {createLoading ? 'שומר…' : 'צור קבוצה'}
          </button>
          <button className="cg-btn-outline" type="button" onClick={() => navigate('/groups')}>
            ביטול
          </button>
        </div>
      </form>

      {/* מודאל קישור יחיד אחרי יצירה */}
      {showModal && selectedGroup?._id && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>הקבוצה נוצרה ✔</h3>

            {selectedGroup.isLocked && (
              <div className="muted" style={{ marginBottom: 8 }}>
                כדי לבקש להצטרף לקבוצה נעולה יש להתחבר — לאחר התחברות נשלחת בקשת הצטרפות אוטומטית.
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <div>קישור לשיתוף:</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <input className="cg-input" readOnly value={shareUrl} onFocus={(e)=>e.target.select()} />
                <button className="gs-btn" type="button" onClick={() => copy(shareUrl)}>העתק</button>
              </div>
            </div>

            <div className="actions-row" style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="gs-btn-outline" type="button" onClick={() => setShowModal(false)}>סגור</button>
              <button className="gs-btn" type="button" onClick={finishToGroup}>סיום</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
