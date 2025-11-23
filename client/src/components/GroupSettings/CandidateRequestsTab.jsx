// src/pages/GroupSettingsPage/CandidateRequestsTab.jsx
import React from 'react';

export default function CandidateRequestsTab({ groupId, requests, loading, error, onApprove, onReject }) {
  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">בקשות מועמדים חדשים</summary>
        <div className="acc-body">
          {loading ? (
            <div>טוען בקשות…</div>
          ) : error ? (
            <div className="err">{error}</div>
          ) : !requests.length ? (
            <div className="muted">אין בקשות כרגע.</div>
          ) : (
            <ul className="list">
              {requests.map((r) => (
                <li key={r._id} className="row">
                  <div className="row-main">
                    <div className="title">{r.name || r.email}</div>
                    <div className="sub">
                      {r.email} · סטטוס: {r.status}
                    </div>
                    {r.description && <div className="sub">{r.description}</div>}
                  </div>
                  <div className="row-actions">
                    <button className="small" onClick={() => onApprove(r)}>
                      אשר/י
                    </button>
                    <button className="small danger" onClick={() => onReject(r)}>
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
