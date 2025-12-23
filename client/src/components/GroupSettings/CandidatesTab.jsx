// src/pages/GroupSettingsPage/CandidatesTab.jsx
import React, { useState } from 'react';
import CandidateForm from '../../components/GroupSettings/CandidateForm';
import http from '../../api/http';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

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
  const { t } = useTranslation();

  // ✅ State מקומי להעלאת תמונה
  const [localUploading, setLocalUploading] = useState(false);

  // ✅ פונקציה להעלאת תמונה
  const onUploadNew = async (file) => {
    console.log('Uploading file:', file); // ← בדיקה
    if (!file) return;
    setLocalUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);


      const { data } = await http.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });


      setCandForm((prev) => ({ ...prev, photoUrl: data.url }));
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(t('candidates.upload.error'));
    } finally {
      setLocalUploading(false);
    }
  };



  return (
    <section className="card">


      {/* <div className="actions-row">
  <button className="clean-btn clean-btn-save">שמירה</button>
  <button className="clean-btn clean-btn-cancel">ביטול</button>
  <button className="clean-btn clean-btn-edit">עריכה</button>
  <button className="clean-btn clean-btn-delete">מחיקה</button>
</div>
 */}


      {/* רשימת מועמדים קיימים */}
      <details open className="acc">
        <summary className="acc-sum">
          {t('candidates.tab.title')}
        </summary>
        <div className="acc-body">
          {candLoading ? (
            <div>{t('candidates.list.loading')}</div>
          ) : candError ? (
            <div className="err">{t(candError)}</div>
          ) : !candidates.length ? (

            <div className="muted">
              {t('candidates.list.empty')}
            </div>
          ) : (
            <ul className="list">
              {candidates.map((c) => (
                <li key={String(c._id)} className="row">
                  <div className="row-main">
                    <div className="title">
                      {c.photoUrl && (
                        <img
                          src={c.photoUrl || '/h.jpg'}
                          alt={
                            c.name
                              ? t('candidates.list.photoAltWithName', {
                                name: c.name,
                              })
                              : t('candidates.list.photoAlt')
                          }
                          className="avatar"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/h.jpg';
                          }}
                        />
                      )}

                      {c.name || t('candidates.list.noName')}{' '}
                      {c.symbol ? `· ${c.symbol}` : ''}
                    </div>

                    {c.description && (
                      <div className="sub">{c.description}</div>
                    )}
                  </div>

                  <div className="row-actions">
                    <button
                      className="clean-btn clean-btn-edit"
                      onClick={() => onOpenEditCandidate(c)}
                    >
                      {t('candidates.list.edit')}
                    </button>
                    <button
                      className="clean-btn clean-btn-cancel"
                      onClick={() => onDeleteCandidate(c)}
                    >
                      {t('candidates.list.remove')}
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
        <summary className="acc-sum">
          {t('candidates.add.title')}
        </summary>
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
            submitLabel={t('candidates.add.submit')}
            submitDisabled={localUploading}
          />
        </div>
      </details>
    </section>
  );
}
