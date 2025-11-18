import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup, clearCreateState } from '../../slices/groupsSlice';
import { useNavigate } from 'react-router-dom';
import './CreateGroup.css';

const makeSlug = (name = '') =>
  encodeURIComponent(
    String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
  );


export default function CreateGroupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { createLoading, createError, justCreated, selectedGroup } = useSelector((s) => s.groups);

  const [form, setForm] = useState({
    name: '',
    description: '',
    endDate: '',
    maxWinners: 1,
    isLocked: false, // false = פתוחה, true = נעולה
  });

  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const toggleLock = () => {
    setForm(prev => ({ ...prev, isLocked: !prev.isLocked }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('שם קבוצה חובה');
    if (!form.description.trim()) return alert('תיאור חובה');
    if (!form.endDate) return alert('תאריך סיום חובה');

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
    catch { }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const slug =
    selectedGroup?.name
      ? makeSlug(selectedGroup.name)
      : '';

  const sharePath = selectedGroup?._id
    ? (selectedGroup.isLocked
      ? `/join/${selectedGroup._id}`
      : `/groups/${slug}`)
    : '';

  const shareUrl = sharePath ? `${origin}${sharePath}` : '';

  const prettyShareUrl = shareUrl ? decodeURI(shareUrl) : ''; // 👈 מה שמציגים בעין

  const copyShareUrl = async () => {                         // 👈 במקום copy הישן
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(prettyShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // אפשר להשאיר ריק או לשים fallback עם input זמני אם תרצי
    }
  };




  const finishToGroup = () => {
    setShowModal(false);
    dispatch(clearCreateState());

    if (selectedGroup?._id) {
      const slug = makeSlug(selectedGroup.name || selectedGroup._id);
      navigate(`/groups/${slug}`, {
        state: { groupId: selectedGroup._id },
      });
    } else {
      navigate('/groups');
    }
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
          תיאור *
          <textarea
            className="cg-input"
            rows={3}
            name="description"
            value={form.description}
            onChange={onChange}
            required
          />
        </label>

        <label className="cg-label">
          תאריך סיום *
          <input className="cg-input" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
        </label>

        <label className="cg-label">
          מקסימום זוכים
          <input
            className="cg-input"
            type="number"
            min={1}
            max={10}
            name="maxWinners"
            value={form.maxWinners}
            onChange={onChange}
          />
        </label>

        <div className="cg-label">
          מצב קבוצה *
          <div className="switch-container">
            <span>נעולה</span>
            <label className="switch">
              <input type="checkbox" checked={form.isLocked} onChange={toggleLock} />
              <span className="slider round"></span>
            </label>
            <span>פתוחה </span>
          </div>
        </div>

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
                <input
                  className="cg-input"
                  readOnly
                  value={prettyShareUrl}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  className="gs-btn"
                  type="button"
                  onClick={copyShareUrl}
                >
                  {copied ? 'הועתק ✓' : 'העתק'}
                </button>

              </div>
            </div>

            <div className="actions-row" style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="gs-btn" type="button" onClick={finishToGroup}>סיום</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
