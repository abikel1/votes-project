// src/pages/GroupSettingsPage/CandidatesTab.jsx
import CandidateForm from '../../components/GroupSettings/CandidateForm';

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
                      {c.photoUrl && (
                        <img className="avatar" src={c.photoUrl} alt="" />
                      )}
                      {c.name || '(ללא שם)'} {c.symbol ? `· ${c.symbol}` : ''}
                    </div>
                    {c.description && <div className="sub">{c.description}</div>}
                  </div>
                  <div className="row-actions">
                    <button
                      className="small"
                      onClick={() => onOpenEditCandidate(c)}
                    >
                      עריכה
                    </button>
                    <button
                      className="small danger"
                      onClick={() => onDeleteCandidate(String(c._id))}
                    >
                      הסרה
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
          <CandidateForm
            form={candForm}
            errors={candErrors}
            onChange={(name, value) => {
              setCandForm((prev) => ({ ...prev, [name]: value }));
              setCandErrors((prev) => ({ ...prev, [name]: undefined }));
            }}
            onSubmit={onAddCandidate}
            uploading={uploadingNew}
            onUploadFile={onUploadNew}
            fileInputRef={newFileInputRef}
            clearPhoto={clearNewPhoto}
            submitLabel="הוסף/י מועמד/ת"
            submitDisabled={uploadingNew}
          />
        </div>
      </details>
    </section>
  );
}
