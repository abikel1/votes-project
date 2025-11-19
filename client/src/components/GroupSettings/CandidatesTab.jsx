// src/pages/GroupSettingsPage/CandidatesTab.jsx
export default function CandidatesTab({
  candidates,
  candLoading,
  candError,
  candForm,
  candErrors,
  setCandForm,
  setCandErrors,
  onAddCandidate,
  onDeleteCandidate,
  onOpenEditCandidate,
  uploadingNew,
  onUploadNew,
  newFileInputRef,
  clearNewPhoto,
}) {
  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">מועמדים</summary>
        <div className="acc-body">
          {candLoading ? (
            <div>טוען מועמדים…</div>
          ) : candError ? (
            <div className="err">{candError}</div>
          ) : !candidates.length ? (
            <div className="muted">אין מועמדים בקבוצה.</div>
          ) : (
            <ul className="list">
              {candidates.map((c) => (
                <li key={String(c._id)} className="row">
                  <div className="row-main">
                    <div className="title">
                      {c.photoUrl && <img className="avatar" src={c.photoUrl} alt="" />}
                      {c.name || '(ללא שם)'} {c.symbol ? `· ${c.symbol}` : ''}
                    </div>
                    {c.description && <div className="sub">{c.description}</div>}
                  </div>
                  <div className="row-actions">
                    <button className="small" onClick={() => onOpenEditCandidate(c)}>
                      עריכה
                    </button>
                    <button
                      className="small danger"
                      onClick={() => onDeleteCandidate(String(c._id))}
                    >
                      הסר/י
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>

      <details className="acc">
        <summary className="acc-sum">הוספת מועמד/ת</summary>
        <div className="acc-body">
          <form onSubmit={onAddCandidate} className="field">
            <label>שם *</label>
            <input
              className="input"
              name="name"
              value={candForm.name}
              onChange={(e) => {
                const value = e.target.value;
                setCandForm((p) => ({ ...p, name: value }));
                setCandErrors((prev) => ({ ...prev, name: undefined }));
              }}
              required
            />
            {candErrors.name && (
              <div className="err small-err">{candErrors.name}</div>
            )}

            <label>תיאור</label>
            <textarea
              className="input"
              rows={3}
              name="description"
              value={candForm.description}
              onChange={(e) => {
                const value = e.target.value;
                setCandForm((p) => ({ ...p, description: value }));
                setCandErrors((prev) => ({ ...prev, description: undefined }));
              }}
            />
            {candErrors.description && (
              <div className="err small-err">{candErrors.description}</div>
            )}

            <label>סמל (אופציונלי)</label>
            <input
              className="input"
              name="symbol"
              value={candForm.symbol}
              onChange={(e) => {
                const value = e.target.value;
                setCandForm((p) => ({ ...p, symbol: value }));
                setCandErrors((prev) => ({ ...prev, symbol: undefined }));
              }}
              placeholder="למשל: א׳"
            />
            {candErrors.symbol && (
              <div className="err small-err">{candErrors.symbol}</div>
            )}

            <label>תמונה</label>

            <input
              ref={newFileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => onUploadNew(e.target.files?.[0])}
              disabled={uploadingNew}
            />

            {!candForm.photoUrl ? (
              <div className="upload-row">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onUploadNew(e.target.files?.[0])}
                  disabled={uploadingNew}
                />
                {uploadingNew && <span className="muted">מעלה…</span>}
              </div>
            ) : (
              <div className="thumb-row">
                <img
                  className="thumb"
                  src={candForm.photoUrl}
                  alt="תצוגה מקדימה"
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="gs-btn"
                    onClick={() => newFileInputRef.current?.click()}
                    disabled={uploadingNew}
                  >
                    שינוי תמונה
                  </button>
                  <button
                    type="button"
                    className="gs-btn-outline"
                    onClick={clearNewPhoto}
                    disabled={uploadingNew}
                  >
                    הסר תמונה
                  </button>
                </div>
                {uploadingNew && <span className="muted">מעלה…</span>}
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <button className="gs-btn" type="submit">
                הוסף/י מועמד/ת
              </button>
            </div>
          </form>
        </div>
      </details>
    </section>
  );
}
