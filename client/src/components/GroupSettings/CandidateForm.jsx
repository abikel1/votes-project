import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageCropModal from '../ImageCropModal';

export default function CandidateForm({
  form,
  errors = {},
  onChange,
  onSubmit,
  uploading = false,
  onUploadFile,
  fileInputRef,
  clearPhoto,
  submitLabel,
  submitDisabled = false,
}) {
  const { t } = useTranslation();

  const [fileToCrop, setFileToCrop] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!onUploadFile) return;

    setFileToCrop(file);
    e.target.value = '';
  };

  const handleCroppedFile = (croppedFile) => {
    setFileToCrop(null);
    if (!croppedFile || !onUploadFile) return;

    onUploadFile(croppedFile);
  };

  const handleCancelCrop = () => {
    setFileToCrop(null);
  };

  return (
    <form onSubmit={onSubmit} className="field">
      <label>{t('candidates.form.nameLabel')}</label>
      <input
        className="input"
        name="name"
        value={form.name}
        onChange={(e) => onChange('name', e.target.value)}
        required
      />
      {errors.name && (
        <div className="err small-err">{t(errors.name)}</div>
      )}

      <label>{t('candidates.form.descriptionLabel')}</label>
      <textarea
        className="input"
        rows={3}
        name="description"
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        required
      />
      {errors.description && (
        <div className="err small-err">{t(errors.description)}</div>
      )}

      <label>{t('candidates.form.symbolLabel')}</label>
      <input
        className="input"
        name="symbol"
        value={form.symbol}
        onChange={(e) => onChange('symbol', e.target.value)}
        placeholder={t('candidates.form.symbolPlaceholder')}
        required
      />
      {errors.symbol && (
        <div className="err small-err">{t(errors.symbol)}</div>
      )}

      <label>{t('candidates.form.photoLabel')}</label>

      {fileInputRef && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={uploading}
        />
      )}

      {!form.photoUrl ? (
        <div className="upload-row">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && (
            <span className="muted">
              {t('candidates.form.uploading')}
            </span>
          )}
        </div>
      ) : (
        <div className="thumb-row">
          <img
            className="thumb"
            src={form.photoUrl}
            alt={t('candidates.form.previewAlt')}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {fileInputRef && (
              <button
                type="button"
                className="clean-btn clean-btn-save"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {t('candidates.form.changePhoto')}
              </button>
            )}
            {clearPhoto && (
              <button
                type="button"
                className="clean-btn clean-btn-cancel"
                onClick={clearPhoto}
                disabled={uploading}
              >
                {t('candidates.form.removePhoto')}
              </button>
            )}
          </div>
          {uploading && (
            <span className="muted">
              {t('candidates.form.uploading')}
            </span>
          )}
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <button
          className="clean-btn clean-btn-save"
          type="submit"
          disabled={submitDisabled}
        >
          {submitLabel ?? t('common.save')}
        </button>
      </div>

      {fileToCrop && (
        <ImageCropModal
          file={fileToCrop}
          aspect={1}
          onCancel={handleCancelCrop}
          onCropped={handleCroppedFile}
        />
      )}
    </form>
  );
}
