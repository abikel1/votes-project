import React from 'react';
import './ConfirmModal.css';
import { useTranslation } from 'react-i18next';

export default function ConfirmModal({ open, message, onConfirm, onCancel }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <p>{message}</p>

        <div className="actions">
          <button className="yes" onClick={onConfirm}>
            {t('common.yes')}
          </button>
          <button className="no" onClick={onCancel}>
            {t('common.no')}
          </button>
        </div>
      </div>
    </div>
  );
}
