import { useTranslation } from 'react-i18next';

export default function JoinRequestsTab({
  groupId,
  reqs,
  reqsLoading,
  reqsError,
  onApprove,
  onReject,
}) {
  const { t, i18n } = useTranslation();

  const formatDateTime = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(
        i18n.language === 'he' ? 'he-IL' : 'en-GB',
      );
    } catch {
      return iso;
    }
  };

  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">
          {t('joinRequests.title')}
        </summary>
        <div className="acc-body">
          {reqsLoading ? (
            <div>{t('joinRequests.loading')}</div>
          ) : reqsError ? (
            <div className="err">{reqsError}</div>
          ) : !reqs.length ? (
            <div className="muted">{t('joinRequests.empty')}</div>
          ) : (
            <ul className="list">
              {reqs.map((r) => (
                <li key={r._id} className="row">
                  <div className="row-main">
                    <div className="title">{r.name || r.email}</div>
                    <div className="sub">
                      {r.email} · {formatDateTime(r.createdAt)}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button
                      className="clean-btn clean-btn-save"
                      onClick={() => onApprove(r)}
                    >
                      {t('joinRequests.approve')}
                    </button>
                    <button
                      className="clean-btn clean-btn-cancel"
                      onClick={() => onReject(r)}
                    >
                      {t('joinRequests.reject')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}
