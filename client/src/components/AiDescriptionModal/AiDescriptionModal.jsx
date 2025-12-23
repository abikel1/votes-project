import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import http from '../../api/http';
import './AiDescriptionModal.css';
import { useTranslation } from 'react-i18next';

export default function AiDescriptionModal({ isOpen, groupName, onApply, onClose }) {
  const { t } = useTranslation();

  const [aiHint, setAiHint] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAiHint('');
      setAiDraft('');
      setAiLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (aiLoading) return;
    onClose();
  };

  const generateAiDescription = async () => {
    if (!groupName.trim()) {
      toast.error(t('groups.create.ai.fillNameFirstError'));
      return;
    }

    try {
      setAiLoading(true);
      const { data } = await http.post('/groups/ai-description', {
        name: groupName,
        hint: aiHint,
      });

      if (!data || !data.description) {
        toast.error(t('groups.create.ai.noDescriptionError'));
        return;
      }

      setAiDraft(data.description);
      toast.success(t('groups.create.ai.createdToast'));
    } catch (err) {
      console.error('AI description error', err);
      toast.error(err?.response?.data?.message || t('groups.create.ai.genericError'));
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiDescription = () => {
    if (!aiDraft.trim()) return;
    onApply(aiDraft);
    toast.success(t('groups.create.ai.appliedToast'));
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal ai-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-icon">
            <span className="ai-icon-emoji">✨</span>
          </div>
          <div>
            <h3>{t('groups.create.ai.modal.title')}</h3>
            <p className="ai-modal-subtitle">{t('groups.create.ai.modal.subtitle')}</p>
          </div>
        </div>

        <label className="cg-label" style={{ marginTop: 4 }}>
          {t('groups.create.ai.hintLabel')}
          <input
            className="cg-input"
            type="text"
            placeholder={t('groups.create.ai.hintPlaceholder')}
            value={aiHint}
            onChange={(e) => setAiHint(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="cg-btn ai-generate-btn"
          onClick={generateAiDescription}
          disabled={aiLoading || !groupName.trim()}
        >
          {aiLoading ? t('groups.create.ai.generating') : t('groups.create.ai.generate')}
        </button>

        {aiDraft && (
          <div className="ai-preview-block">
            <div className="cg-ai-preview-label">{t('groups.create.ai.previewLabel')}</div>
            <textarea className="cg-input cg-ai-preview" rows={4} readOnly value={aiDraft} />
          </div>
        )}

        <div className="actions-row ai-actions-row">
          <button
            className="gs-btn"
            type="button"
            onClick={applyAiDescription}
            disabled={!aiDraft.trim()}
          >
            {t('groups.create.ai.useDescription')}
          </button>

          <button className="cg-btn-outline" type="button" onClick={handleBackdropClick}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
