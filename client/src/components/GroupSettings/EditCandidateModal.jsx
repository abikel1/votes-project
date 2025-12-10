// src/pages/GroupSettingsPage/EditCandidateModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageCropModal from '../../components/ImageCropModal';

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
  canEditName = true,
}) {
  const { t } = useTranslation();
  const [fileToCrop, setFileToCrop] = useState(null); // 👈 קובץ לחיתוך במודאל

  if (!open) return null;

  const disabled = updatingThisCandidate;

  // בחירת קובץ (גם מהאינפוט הנסתר וגם מהגלוי)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || disabled || uploadingEdit) return;

    setFileToCrop(file);   // 👈 פותח מודאל החיתוך
    e.target.value = '';   // כדי שאפשר יהיה לבחור שוב אותו קובץ
  };

  // אחרי שהמשתמש סיים חיתוך ולחץ "שמור"
  const handleCroppedFile = (croppedFile) => {
    setFileToCrop(null);
    if (!croppedFile || !onUploadEdit) return;

    // שולחים להורה כבר את הקובץ החתוך
    onUploadEdit(croppedFile);
  };

  const handleCancelCrop = () => {
    setFileToCrop(null);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => !disabled && onCancelEditCandidate()}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t('candidates.edit.title')}</h3>

        <form className="field" onSubmit={onSaveEditedCandidate}>
          {/* Name */}
          <label>{t('candidates.form.nameLabel')}</label>
          <input
            className="input"
            name="name"
            value={editCandForm.name}
            onChange={onEditCandChange}
            required={canEditName}
            disabled={disabled || !canEditName}
          />
          {editCandErrors.name && (
            <div className="err small-err">{t(editCandErrors.name)}</div>
          )}

          {/* Description */}
          <label>{t('candidates.form.descriptionLabel')}</label>
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
            <div className="err small-err">{t(editCandErrors.description)}</div>
          )}

          {/* Symbol */}
          <label>{t('candidates.form.symbolLabel')}</label>
          <input
            className="input"
            name="symbol"
            value={editCandForm.symbol}
            onChange={onEditCandChange}
            placeholder={t('candidates.form.symbolPlaceholder')}
            disabled={disabled}
            required
          />
          {editCandErrors.symbol && (
            <div className="err small-err">{t(editCandErrors.symbol)}</div>
          )}

          {/* Image */}
          <label>{t('candidates.form.photoLabel')}</label>

          {/* אינפוט נסתר ל"שינוי תמונה" */}
          <input
            ref={editFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}   // 👈 דרך המודאל
            disabled={disabled || uploadingEdit}
          />

          {!editCandForm.photoUrl ? (
            <div className="upload-row">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}  // 👈 גם כאן
                disabled={disabled || uploadingEdit}
              />
              {(disabled || uploadingEdit) && (
                <span className="muted">
                  {t('candidates.form.uploading')}
                </span>
              )}
            </div>
          ) : (
            <div className="thumb-row">
              <img
                className="thumb"
                src={editCandForm.photoUrl}
                alt={t('candidates.form.previewAlt')}
              />

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="clean-btn clean-btn-edit"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={disabled || uploadingEdit}
                >
                  {t('candidates.form.changePhoto')}
                </button>

                <button
                  type="button"
                  className="clean-btn clean-btn-cancel"
                  onClick={clearEditPhoto}
                  disabled={disabled}
                >
                  {t('candidates.form.removePhoto')}
                </button>
              </div>

              {(disabled || uploadingEdit) && (
                <span className="muted">
                  {t('candidates.form.uploading')}
                </span>
              )}
            </div>
          )}

          {/* General update error */}
          {updateCandidateError && (
            <div className="err" style={{ marginTop: 6 }}>
              {t(updateCandidateError)}
            </div>
          )}

          <div className="actions-row">
            <button
              className="clean-btn clean-btn-save"
              type="submit"
              disabled={disabled}
            >
              {disabled
                ? t('candidates.edit.saving')
                : t('candidates.edit.save')}
            </button>

            <button
              className="clean-btn clean-btn-cancel"
              type="button"
              onClick={onCancelEditCandidate}
              disabled={disabled}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>

        {/* מודאל חיתוך – נפתח כשיש fileToCrop */}
        {fileToCrop && (
          <ImageCropModal
            file={fileToCrop}
            aspect={1}          // 1:1 לפרופיל עגול
            onCancel={handleCancelCrop}
            onCropped={handleCroppedFile}
          />
        )}
      </div>
    </div>
  );
}
