// src/pages/GroupSettingsPage/DangerTab.jsx
import { useTranslation } from 'react-i18next';

export default function DangerTab({ onOpenDelete }) {
  const { t } = useTranslation();

  return (
    <section className="card">
      <details open className="acc danger">
        <summary className="acc-sum">
          {t('groupSettings.danger.title')}
        </summary>
        <div className="acc-body">
          <p className="danger-text">
            {t('groupSettings.danger.warning')}
          </p>
          <button
            className="clean-btn clean-btn-delete"
            onClick={onOpenDelete}
          >
            {t('groupSettings.danger.deleteButton')}
          </button>
        </div>
      </details>
    </section>
  );
}
