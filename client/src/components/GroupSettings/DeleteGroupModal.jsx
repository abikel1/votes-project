// src/pages/GroupSettingsPage/DeleteGroupModal.jsx
export default function DeleteGroupModal({
  open,
  confirmSlug,
  typedSlug,
  setTypedSlug,
  onClose,
  onDelete,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>מחק/י את הקבוצה</h3>
        <p className="muted" style={{ marginTop: 6 }}>
          כדי לאשר, הקלד/י בתיבה את <b>{confirmSlug}</b>
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
            ביטול
          </button>
          <button
            className="btn-danger"
            disabled={typedSlug.trim() !== confirmSlug}
            onClick={onDelete}
            title={
              typedSlug.trim() !== confirmSlug
                ? 'יש להקליד בדיוק את הערך לעיל'
                : undefined
            }
          >
            מחיקת הקבוצה לצמיתות
          </button>
        </div>
      </div>
    </div>
  );
}
