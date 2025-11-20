import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <p>{message}</p>

        <div className="actions">
          <button className="yes" onClick={onConfirm}>כן</button>
          <button className="no" onClick={onCancel}>לא</button>
        </div>
      </div>
    </div>
  );
}
