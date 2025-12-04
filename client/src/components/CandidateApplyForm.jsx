// src/components/CandidateApplyForm.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import {
  applyCandidate,
  selectApplyingCandidate,
  selectApplyCandidateError,
} from '../slices/candidateSlice';

import { selectUserId } from '../slices/authSlice';
import CandidateForm from './GroupSettings/CandidateForm';
import { uploadImage } from './GroupSettings/uploadImage';

import '../pages/Register/RegisterPage.css';

export default function CandidateApplyForm({ groupId, candidateRequests = [] }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const loading = useSelector(selectApplyingCandidate);
  const error = useSelector(selectApplyCandidateError);

  const userId = useSelector(selectUserId);
  const userEmail =
    useSelector((s) => s.auth.userEmail) ||
    localStorage.getItem('userEmail') ||
    '';

  const [form, setForm] = useState({
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [userRequest, setUserRequest] = useState(null);

  useEffect(() => {
    const emailNorm = (userEmail || '').trim().toLowerCase();

    const req = (candidateRequests || []).find((r) => {
      const rid = r.userId && String(r.userId);
      const remail = (r.email || '').trim().toLowerCase();
      return (
        (userId && rid && String(userId) === rid) ||
        (emailNorm && remail && emailNorm === remail)
      );
    });

    setUserRequest(req || null);
  }, [candidateRequests, userId, userEmail]);

  const handleFieldChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const clearPhoto = () => {
    setForm((prev) => ({ ...prev, photoUrl: '' }));
  };

  const handleUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file, form.photoUrl || '');
      if (!url) return;
      setForm((prev) => ({ ...prev, photoUrl: url }));
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(t('candidates.upload.error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupId) {
      toast.error(t('candidateApply.invalidGroup'));
      return;
    }

    if (!form.name.trim()) {
      const msg = t('candidateApply.nameRequired');
      setErrors((prev) => ({ ...prev, name: msg }));
      toast.error(msg);
      return;
    }

    try {
      const candidateData = {
        groupId,
        name: form.name.trim(),
        description: form.description.trim(),
        symbol: form.symbol.trim(),
        photoUrl: form.photoUrl.trim() || '/h.jpg',
      };

      const out = await dispatch(applyCandidate(candidateData)).unwrap();

      if (out?.request) {
        setUserRequest(out.request);
      }

      toast.success(t('candidateApply.success'));
      setForm({ name: '', description: '', symbol: '', photoUrl: '' });
      setErrors({});
      clearPhoto();
    } catch (err) {
      const message = err?.message || t('candidateApply.genericError');
      toast.error(message);
    }
  };


  if (!groupId) {
    return <p>{t('candidateApply.invalidGroup')}</p>;
  }

  if (!userId && !userEmail) {
    return (
      <div className="alert alert-info">
        {t('candidateApply.mustLogin')}
      </div>
    );
  }

  // סטטוסים שחוסמים את הצגת הטופס
  if (userRequest) {
    if (userRequest.status === 'pending') {
      return (
        <div className="alert alert-info">
          {t('candidateApply.status.pending')}
        </div>
      );
    }

    if (userRequest.status === 'approved') {
      return (
        <div className="alert alert-success">
          {t('candidateApply.status.approved')}
        </div>
      );
    }
  }

  return (
    <div className="auth-card register-card">
      {/* נדחה */}
      {userRequest?.status === 'rejected' && (
        <div className="alert alert-warning">
          {t('candidateApply.status.rejected')}
        </div>
      )}

      {/* נמחק */}
      {userRequest?.status === 'removed' && (
        <div className="alert alert-warning">
          {t('candidateApply.status.removed')}
        </div>
      )}

      <div className="auth-header">
        <h1>{t('candidateApply.title')}</h1>
        <p>{t('candidateApply.subtitle')}</p>
      </div>

      <CandidateForm
        form={form}
        errors={errors}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        uploading={uploading}
        onUploadFile={handleUpload}
        fileInputRef={fileInputRef}
        clearPhoto={clearPhoto}
        submitLabel={loading ? t('candidateApply.submitting') : t('candidateApply.submit')}
        submitDisabled={loading || uploading}
      />

      {error && <p className="error-text">❌ {error}</p>}
    </div>
  );
}
