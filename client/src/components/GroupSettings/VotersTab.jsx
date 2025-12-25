import { useTranslation } from 'react-i18next';

export default function VotersTab({
  voters,
  votersLoading,
  votersError,
  formatVoterTitle,
}) {
  const { t, i18n } = useTranslation();

  const formatDateTime = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(
        i18n.language === 'he' ? 'he-IL' : 'en-GB'
      );
    } catch {
      return iso;
    }
  };

  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">{t('voters.title')}</summary>
        <div className="acc-body">
          {votersLoading ? (
            <div>{t('voters.loading')}</div>
          ) : votersError ? (
            <div className="err">{votersError}</div>
          ) : !voters.length ? (
            <div className="muted">{t('voters.empty')}</div>
          ) : (
            <ul className="list">
              {voters.map((v) => {
                const titleName = formatVoterTitle(v);
                const email = v.email;
                const when = v.lastVoteAt || v.votedAt || v.createdAt;

                return (
                  <li
                    key={String(v._id || v.userId || v.id)}
                    className="row"
                  >
                    <div className="row-main">
                      <div className="title">{titleName}</div>
                      <div className="sub">
                        {email ? email : ''}
                        {when ? ` · ${formatDateTime(when)}` : ''}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}
