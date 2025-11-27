// src/pages/GroupSettingsPage/EditCandidateModal.jsx
export default function EditCandidateModal({
  open,
  editCandForm,
  editCandErrors,
  updatingThisCandidate,
  updateCandidateError,
  onEditCandChange,
  onSaveEditedCandidate,
  onCancelEditCandidate,
  uploadingEdit,
  onUploadEdit,
  editFileInputRef,
  clearEditPhoto,
}) {
  if (!open) return null;

  const disabled = updatingThisCandidate;

  return (
    <div
      className="modal-backdrop"
      onClick={() => !disabled && onCancelEditCandidate()}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>עריכת מועמד/ת</h3>
        <form className="field" onSubmit={onSaveEditedCandidate}>
          <label>שם *</label>
          <input
            className="input"
            name="name"
            value={editCandForm.name}
            onChange={onEditCandChange}
            required
            disabled={disabled}
          />
          {editCandErrors.name && (
            <div className="err small-err">{editCandErrors.name}</div>
          )}

          <label>תיאור</label>
          <textarea
            className="input"
            rows={3}
            name="description"
            value={editCandForm.description}
            onChange={onEditCandChange}
            disabled={disabled}
            required
          />
          {editCandErrors.description && (
            <div className="err small-err">{editCandErrors.description}</div>
          )}

          <label>סמל</label>
          <input
            className="input"
            name="symbol"
            value={editCandForm.symbol}
            onChange={onEditCandChange}
            placeholder="למשל: א׳"
            disabled={disabled}
            required
          />
          {editCandErrors.symbol && (
            <div className="err small-err">{editCandErrors.symbol}</div>
          )}

          <label>תמונה</label>

          <input
            ref={editFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => onUploadEdit(e.target.files?.[0])}
            disabled={disabled || uploadingEdit}
          />

          {!editCandForm.photoUrl ? (
            <div className="upload-row">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onUploadEdit(e.target.files?.[0])}
                disabled={disabled || uploadingEdit}
              />
              {(disabled || uploadingEdit) && (
                <span className="muted">מעלה…</span>
              )}
            </div>
          ) : (
            <div className="thumb-row">
              <img
                className="thumb"
                src={editCandForm.photoUrl}
                alt="תצוגה מקדימה"
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="gs-btn"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={disabled || uploadingEdit}
                >
                  שינוי תמונה
                </button>
                <button
                  type="button"
                  className="gs-btn-outline"
                  onClick={clearEditPhoto}
                  disabled={disabled}
                >
                  הסר תמונה
                </button>
              </div>
              {(disabled || uploadingEdit) && (
                <span className="muted">מעלה…</span>
              )}
            </div>
          )}

          {updateCandidateError && (
            <div className="err" style={{ marginTop: 6 }}>
              {updateCandidateError}
            </div>
          )}

          <div className="actions-row">
            <button
              className="gs-btn"
              type="submit"
              disabled={disabled}
            >
              {disabled ? 'שומר/ת…' : 'שמור/י'}
            </button>
            <button
              className="gs-btn-outline"
              type="button"
              onClick={onCancelEditCandidate}
              disabled={disabled}
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
