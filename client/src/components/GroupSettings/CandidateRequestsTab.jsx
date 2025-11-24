import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidateRequestsByGroup, selectCandidateRequestsForGroup } from '../../slices/candidateSlice';

export default function CandidateRequestsTab({ groupId, onApprove, onReject }) {
  const dispatch = useDispatch();

  const requests = useSelector(state => selectCandidateRequestsForGroup(state, groupId));
  const loading = useSelector(state => state.candidates.loadingRequests);
  const error = useSelector(state => state.candidates.requestsError);

  useEffect(() => {
    dispatch(fetchCandidateRequestsByGroup(groupId));
  }, [groupId, dispatch]);

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
              {requests.map(r => (
                <li key={r._id} className="row">
                  <div className="row-main">
                    <div className="title">{r.name || r.email}</div>
                    <div className="sub">{r.email} · סטטוס: {r.status}</div>
                    {r.description && <div className="sub">{r.description}</div>}
                  </div>
                  <div className="row-actions">
                    <button className="small" onClick={() => onApprove(r)}>אשר/י</button>
                    <button className="small danger" onClick={() => onReject(r)}>דחה/י</button>
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
