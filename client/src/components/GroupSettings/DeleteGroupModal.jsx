import { useTranslation } from 'react-i18next';
import './DeleteGroupModal.css';

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
      <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="delete-title">{t('groupSettings.deleteModal.title')}</h2>
        <div className="delete-instruction">
          {t('groupSettings.deleteModal.typeToConfirm')}
          <div className="delete-repo">{confirmSlug}</div>
        </div>
        <input
          className="delete-confirm-input"
          placeholder={confirmSlug}
          value={typedSlug}
          onChange={(e) => setTypedSlug(e.target.value)}
          style={{ direction: 'ltr' }}
        />

        <div className="delete-actions">
          <button
            className="clean-btn clean-btn-delete"
            disabled={typedSlug.trim() !== confirmSlug}
            onClick={onDelete}
          >
            {t('groupSettings.deleteModal.deleteForever')}
          </button>

          <button className="clean-btn clean-btn-cancel" onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
