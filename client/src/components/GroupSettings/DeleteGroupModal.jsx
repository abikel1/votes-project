// src/pages/GroupSettingsPage/DeleteGroupModal.jsx
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

        {/* כותרת */}
        <h2 className="delete-title">מחיקת קבוצה</h2>

        {/* הוראה + שם הקבוצה */}
        <div className="delete-instruction">
          כדי לאשר, הקלידי:
          <div className="delete-repo">{confirmSlug}</div>
        </div>

        {/* שדה קלט */}
        <input
          className="delete-confirm-input"
          placeholder={confirmSlug}
          value={typedSlug}
          onChange={(e) => setTypedSlug(e.target.value)}
          style={{ direction: 'ltr' }}
        />

        {/* כפתורים */}
        <div className="delete-actions">


          <button
            className="clean-btn clean-btn-delete"
            disabled={typedSlug.trim() !== confirmSlug}
            onClick={onDelete}
          >
            מחיקת הקבוצה לצמיתות
          </button>
          <button
            className="clean-btn clean-btn-cancel"
            onClick={onClose}
          >
            ביטול
          </button>
        </div>

      </div>
    </div>
  );
}
