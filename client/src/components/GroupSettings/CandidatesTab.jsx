// src/pages/GroupSettingsPage/CandidatesTab.jsx
import React, { useState } from 'react';
import CandidateForm from '../../components/GroupSettings/CandidateForm';
import http from '../../api/http';

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
  newFileInputRef,
  clearNewPhoto,
}) {
  // ✅ State מקומי להעלאת תמונה
  const [localUploading, setLocalUploading] = useState(false);

  // ✅ פונקציה להעלאת תמונה
const onUploadNew = async (file) => {
  if (!file) return;
  setLocalUploading(true);

  const formData = new FormData();
  formData.append('image', file);

  const { data } = await http.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  setCandForm((prev) => ({ ...prev, photoUrl: data.url }));
  setLocalUploading(false);
};


  return (
    <section className="card">
      {/* רשימת מועמדים קיימים */}
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


                        <img
                          src={c.photoUrl || '/h.jpg'}           // אם אין URL – ברירת מחדל
                          alt={c.name || 'תמונת מועמד'}
                          className="avatar"
                          onError={(e) => {
                            e.currentTarget.onerror = null;      // מונע loop אם גם הברירת מחדל לא קיימת
                            e.currentTarget.src = '/h.jpg';     // מציב ברירת מחדל במקרה של שגיאה בטעינה
                          }}
                        />


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
                      onClick={() => onDeleteCandidate(c)}
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

      {/* הוספת מועמד/ת חדש/ה */}
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
            uploading={localUploading}
            onUploadFile={onUploadNew}
            fileInputRef={newFileInputRef}
            clearPhoto={clearNewPhoto}
            submitLabel="הוסף/י מועמד/ת"
            submitDisabled={localUploading}
          />
        </div>
      </details>
    </section>
  );
}
