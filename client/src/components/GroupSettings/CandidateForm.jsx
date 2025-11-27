// src/components/GroupSettings/CandidateForm.jsx
import React from 'react';

export default function CandidateForm({
    form,
    errors = {},
    onChange,
    onSubmit,
    uploading = false,
    onUploadFile,
    fileInputRef,
    clearPhoto,
    submitLabel = 'שמור',
    submitDisabled = false,
}) {
    return (
        <form onSubmit={onSubmit} className="field">
            <label>שם *</label>
            <input
                className="input"
                name="name"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                required
            />
            {errors.name && <div className="err small-err">{errors.name}</div>}

            <label>תיאור</label>
            <textarea
                className="input"
                rows={3}
                name="description"
                value={form.description}
                onChange={(e) => onChange('description', e.target.value)}
                required
            />
            {errors.description && (
                <div className="err small-err">{errors.description}</div>
            )}

            <label>סמל</label>
            <input
                className="input"
                name="symbol"
                value={form.symbol}
                onChange={(e) => onChange('symbol', e.target.value)}
                placeholder="למשל: א׳"
                required
            />
            {errors.symbol && (
                <div className="err small-err">{errors.symbol}</div>
            )}

            <label>תמונה</label>

            {/* אינפוט נסתר ל"שינוי תמונה" */}
            {fileInputRef && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) =>
                        onUploadFile && onUploadFile(e.target.files?.[0])
                    }
                    disabled={uploading}
                />
            )}

            {!form.photoUrl ? (
                <div className="upload-row">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            onUploadFile && onUploadFile(e.target.files?.[0])
                        }
                        disabled={uploading}
                    />
                    {uploading && <span className="muted">מעלה…</span>}
                </div>
            ) : (
                <div className="thumb-row">
                    <img
                        className="thumb"
                        src={form.photoUrl}
                        alt="תצוגה מקדימה"
                    />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {fileInputRef && (
                            <button
                                type="button"
                                className="gs-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                שינוי תמונה
                            </button>
                        )}
                        {clearPhoto && (
                            <button
                                type="button"
                                className="gs-btn-outline"
                                onClick={clearPhoto}
                                disabled={uploading}
                            >
                                הסרת תמונה
                            </button>
                        )}
                    </div>
                    {uploading && <span className="muted">מעלה…</span>}
                </div>
            )}

            <div style={{ marginTop: 8 }}>
                <button
                    className="gs-btn"
                    type="submit"
                    disabled={submitDisabled}
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
