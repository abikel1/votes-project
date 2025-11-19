// src/pages/GroupSettingsPage/VotersTab.jsx
export default function VotersTab({
  voters,
  votersLoading,
  votersError,
  formatVoterTitle,
}) {
  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">המצביעים</summary>
        <div className="acc-body">
          {votersLoading ? (
            <div>טוען מצביעים…</div>
          ) : votersError ? (
            <div className="err">{votersError}</div>
          ) : !voters.length ? (
            <div className="muted">אין מצביעים עדיין.</div>
          ) : (
            <ul className="list">
              {voters.map((v) => {
                const titleName = formatVoterTitle(v);
                const email = v.email;
                const when = v.lastVoteAt || v.votedAt || v.createdAt;

                return (
                  <li key={String(v._id || v.userId || v.id)} className="row">
                    <div className="row-main">
                      <div className="title">{titleName}</div>
                      <div className="sub">
                        {email ? `${email}` : ''}
                        {when
                          ? ` · ${new Date(when).toLocaleString('he-IL')}`
                          : ''}
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
