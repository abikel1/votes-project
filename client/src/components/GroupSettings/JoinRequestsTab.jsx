// src/pages/GroupSettingsPage/JoinRequestsTab.jsx
export default function JoinRequestsTab({
  groupId,
  reqs,
  reqsLoading,
  reqsError,
  onApprove,
  onReject,
}) {
  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">בקשות הצטרפות</summary>
        <div className="acc-body">
          {reqsLoading ? (
            <div>טוען בקשות…</div>
          ) : reqsError ? (
            <div className="err">{reqsError}</div>
          ) : !reqs.length ? (
            <div className="muted">אין בקשות כרגע.</div>
          ) : (
            <ul className="list">
              {reqs.map((r) => (
                <li key={r._id} className="row">
                  <div className="row-main">
                    <div className="title">{r.name || r.email}</div>
                    <div className="sub">
                      {r.email} · {new Date(r.createdAt).toLocaleString('he-IL')}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button
                      className="small"
                      onClick={() => onApprove(r)}
                    >
                      אשר/י
                    </button>
                    <button
                      className="small danger"
                      onClick={() => onReject(r)}
                    >
                      דחה/י
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
