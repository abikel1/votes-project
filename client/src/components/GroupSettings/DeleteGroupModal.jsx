// src/pages/GroupSettingsPage/DeleteGroupModal.jsx
import { useTranslation } from 'react-i18next';

export default function DeleteGroupModal({
  open,
  confirmSlug,
  typedSlug,
  setTypedSlug,
  onClose,
  onDelete,
}) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t('groupSettings.deleteModal.title')}</h3>

        <p className="muted" style={{ marginTop: 6 }}>
          {t('groupSettings.deleteModal.typeToConfirm')}{' '}
          <b>{confirmSlug}</b>
        </p>

        <input
          className="input"
          placeholder={confirmSlug}
          value={typedSlug}
          onChange={(e) => setTypedSlug(e.target.value)}
          style={{ direction: 'ltr' }}
        />

        <div className="actions-row" style={{ marginTop: 12 }}>
          <button className="gs-btn-outline" onClick={onClose}>
            {t('common.cancel')}
          </button>

          <button
            className="btn-danger"
            disabled={typedSlug.trim() !== confirmSlug}
            onClick={onDelete}
            title={
              typedSlug.trim() !== confirmSlug
                ? t('groupSettings.deleteModal.mustMatch')
                : undefined
            }
          >
            {t('groupSettings.deleteModal.deleteForever')}
          </button>
        </div>
      </div>
    </div>
  );
}
