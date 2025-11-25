import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup, clearCreateState } from '../../slices/groupsSlice';
import { useNavigate } from 'react-router-dom';
import './CreateGroup.css';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const { createLoading, createError, justCreated, selectedGroup } = useSelector((s) => s.groups);

  const [form, setForm] = useState({
    name: '',
    description: '',
    endDate: '',
    candidateEndDate: '', // <-- חדש
    maxWinners: 1,
    isLocked: false, // false = פתוחה, true = נעולה
  });

  const todayStr = new Date().toISOString().slice(0, 10);

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
    setForm((prev) => ({ ...prev, isLocked: !prev.isLocked }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error(t('groups.create.errors.nameRequired'));
      return;
    }

    if (!form.description.trim()) {
      toast.error(t('groups.create.errors.descriptionRequired'));
      return;
    }

    if (!form.endDate) {
      toast.error(t('groups.create.errors.endDateRequired'));
      return;
    }

    if (!form.candidateEndDate) {
      toast.error(t('groups.create.errors.candidateEndDateRequired'));
      return;
    }

    if (new Date(form.candidateEndDate) > new Date(form.endDate)) {
      toast.error(t('groups.create.errors.candidateAfterGroup'));
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      maxWinners: Number(form.maxWinners) || 1,
      isLocked: !!form.isLocked,
      endDate: new Date(form.endDate).toISOString(),
      candidateEndDate: new Date(form.candidateEndDate).toISOString(), // <-- חדש
    };

    dispatch(createGroup(payload));
    toast.success(t('groups.create.toast.created'));
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('groups.create.toast.linkCopied'));
    } catch {
      // אפשר להוסיף toast.error אם רוצים
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const slug =
    selectedGroup?.name
      ? makeSlug(selectedGroup.name)
      : '';

  const sharePath = selectedGroup?._id
    ? (selectedGroup.isLocked
      ? `/join/${slug}`      // 🔒 קבוצה נעולה – משתמשים בשם (slug)
      : `/groups/${slug}`)   // 🌐 קבוצה פתוחה – גם כן בשם
    : '';

  const shareUrl = sharePath ? `${origin}${sharePath}` : '';
  const prettyShareUrl = shareUrl ? decodeURI(shareUrl) : '';

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(prettyShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // אפשר לשים fallback אם תרצי
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
      <h2 className="cg-title">{t('groups.create.title')}</h2>

      <form className="cg-form" onSubmit={onSubmit}>
        <label className="cg-label">
          {t('groups.create.labels.name')} *
          <input
            className="cg-input"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </label>

        <label className="cg-label">
          {t('groups.create.labels.description')} *
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
          {t('groups.create.labels.endDate')} *
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
          {t('groups.create.labels.candidateEndDate')} *
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
          {t('groups.create.labels.maxWinners')}
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
          {t('groups.create.labels.status')} *
          <div className="switch-container">
            <span>{t('groups.create.status.locked')}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={form.isLocked}
                onChange={toggleLock}
              />
              <span className="slider round"></span>
            </label>
            <span>{t('groups.create.status.open')}</span>
          </div>
        </div>

        {createError && <div className="cg-error">{createError}</div>}

        <div className="cg-actions">
          <button className="cg-btn" type="submit" disabled={createLoading}>
            {createLoading
              ? t('groups.create.buttons.saving')
              : t('groups.create.buttons.create')}
          </button>
          <button
            className="cg-btn-outline"
            type="button"
            onClick={() => navigate('/groups')}
          >
            {t('groups.create.buttons.cancel')}
          </button>
        </div>
      </form>

      {showModal && selectedGroup?._id && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>
              {t('groups.create.modal.title')}
            </h3>

            {selectedGroup.isLocked && (
              <div className="muted" style={{ marginBottom: 8 }}>
                {t('groups.create.modal.lockedInfo')}
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <div>{t('groups.create.modal.shareLinkLabel')}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
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
                  {copied
                    ? t('groups.create.modal.shareCopied')
                    : t('groups.create.modal.shareCopy')}
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
                {t('groups.create.modal.finish')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
