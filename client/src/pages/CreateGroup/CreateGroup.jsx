import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup, clearCreateState } from '../../slices/groupsSlice';
import { useNavigate } from 'react-router-dom';
import './CreateGroup.css';
import toast from 'react-hot-toast';
import AiDescriptionModal from '../../components/AiDescriptionModal/AiDescriptionModal';

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

  const { createLoading, createError, justCreated, selectedGroup } = useSelector(
    (s) => s.groups
  );

  const [form, setForm] = useState({
    name: '',
    description: '',
    endDate: '',
    candidateEndDate: '',
    maxWinners: 1,
    isLocked: false,
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // חלון AI
  const [aiModalOpen, setAiModalOpen] = useState(false);

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
    setForm((prev) => ({ ...prev, isLocked: !prev.isLocked }));
  };

  // פתיחת חלון AI
  const openAiModal = () => {
    if (!form.name.trim()) {
      toast.error('קודם צריך למלא שם קבוצה');
      return;
    }
    setAiModalOpen(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('שם קבוצה חובה');
      return;
    }

    if (!form.description.trim()) {
      toast.error('תיאור חובה');
      return;
    }

    if (!form.endDate) {
      toast.error('תאריך סיום חובה');
      return;
    }

    if (!form.candidateEndDate) {
      toast.error('תאריך סיום הגשת מועמדות חובה');
      return;
    }

    if (new Date(form.candidateEndDate) > new Date(form.endDate)) {
      toast.error(
        'תאריך סיום הגשת מועמדות לא יכול להיות אחרי תאריך סיום הקבוצה'
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      maxWinners: Number(form.maxWinners) || 1,
      isLocked: !!form.isLocked,
      endDate: new Date(form.endDate).toISOString(),
      candidateEndDate: new Date(form.candidateEndDate).toISOString(),
    };

    dispatch(createGroup(payload));
    toast.success('הקבוצה נוצרה בהצלחה!');
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const slug = selectedGroup?.name ? makeSlug(selectedGroup.name) : '';

  const sharePath = selectedGroup?._id
    ? selectedGroup.isLocked
      ? `/join/${slug}`
      : `/groups/${slug}`
    : '';

  const shareUrl = sharePath ? `${origin}${sharePath}` : '';
  const prettyShareUrl = shareUrl ? decodeURI(shareUrl) : '';

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(prettyShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { }
  };

  const finishToGroup = () => {
    setShowModal(false);
    dispatch(clearCreateState());

    if (selectedGroup?._id) {
      const slug2 = makeSlug(selectedGroup.name || selectedGroup._id);
      navigate(`/groups/${slug2}`, {
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
          <input
            className="cg-input"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </label>

        <label className="cg-label">
          תיאור *
          <div className="cg-desc-wrapper">
            <textarea
              className="cg-input"
              rows={3}
              name="description"
              value={form.description}
              onChange={onChange}
              required
            />
            <button
              type="button"
              className="cg-ai-icon-btn"
              onClick={openAiModal}
              title="עזרה בכתיבת תיאור עם AI"
            >
              <span className="cg-ai-icon-text">✨</span>
            </button>
          </div>
        </label>

        <label className="cg-label">
          תאריך סיום *
          <input
            min={todayStr}
            className="cg-input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="cg-label">
          תאריך סיום הגשת מועמדות *
          <input
            min={todayStr}
            className="cg-input"
            type="date"
            name="candidateEndDate"
            value={form.candidateEndDate}
            onChange={onChange}
            required
          />
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
              <input
                type="checkbox"
                checked={form.isLocked}
                onChange={toggleLock}
              />
              <span className="slider round"></span>
            </label>
            <span>פתוחה</span>
          </div>
        </div>

        {createError && <div className="cg-error">{createError}</div>}

        <div className="cg-actions">
          <button className="cg-btn" type="submit" disabled={createLoading}>
            {createLoading ? 'שומר…' : 'צור קבוצה'}
          </button>
          <button
            className="cg-btn-outline"
            type="button"
            onClick={() => navigate('/groups')}
          >
            ביטול
          </button>
        </div>
      </form>

      {/* מודל ה-AI החדש */}
      <AiDescriptionModal
        isOpen={aiModalOpen}
        groupName={form.name}
        onApply={(desc) => {
          setForm((prev) => ({ ...prev, description: desc }));
          setAiModalOpen(false);
        }}
        onClose={() => setAiModalOpen(false)}
      />

      {/* חלון אחרי יצירת קבוצה */}
      {showModal && selectedGroup?._id && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>הקבוצה נוצרה ✔</h3>

            {selectedGroup.isLocked && (
              <div className="muted" style={{ marginBottom: 8 }}>
                כדי לבקש להצטרף לקבוצה נעולה יש להתחבר — לאחר התחברות נשלחת
                בקשת הצטרפות אוטומטית.
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <div>קישור לשיתוף:</div>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <input
                  className="cg-input"
                  readOnly
                  value={prettyShareUrl}
                  onFocus={(e) => e.target.select()}
                  style={{ direction: 'ltr', textAlign: 'left' }}
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

            <div
              className="actions-row"
              style={{
                marginTop: 12,
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
              }}
            >
              <button className="gs-btn" type="button" onClick={finishToGroup}>
                סיום
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
