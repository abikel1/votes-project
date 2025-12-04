// src/components/GroupSettings/CandidateRequestsTab.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCandidateRequestsByGroup,
  selectCandidateRequestsForGroup,
} from '../../slices/candidateSlice';
import { useTranslation } from 'react-i18next';

export default function CandidateRequestsTab({ groupId, onApprove, onReject }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const requests = useSelector((state) =>
    selectCandidateRequestsForGroup(state, groupId),
  );

  const loading = useSelector((state) => state.candidates.loadingRequests);
  const error = useSelector((state) => state.candidates.requestsError);

  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchCandidateRequestsByGroup(groupId));
  }, [groupId, dispatch]);

  return (
    <section className="card">
      <details open className="acc">
        <summary className="acc-sum">
          {t('candidates.requests.title')}
        </summary>
        <div className="acc-body">
          {loading ? (
            <div>{t('candidates.requests.loading')}</div>
          ) : error ? (
            <div className="err">
              {/* אם error הוא כבר טקסט אנושי – t יחזיר אותו כמו שהוא, ואם זה key – יתורגם */}
              {t(error)}
            </div>
          ) : !requests.length ? (
            <div className="muted">
              {t('candidates.requests.empty')}
            </div>
          ) : (
            <ul className="list">
              {requests
                .filter((r) => r.status === 'pending')
                .map((r) => (
                  <li key={r._id} className="row">
                    <div className="row-main">
                      <div className="title">{r.name || r.email}</div>
                      <div className="sub">{r.email}</div>
                      {r.description && (
                        <div className="sub">{r.description}</div>
                      )}
                    </div>

                    <div className="row-actions">
                      <button
                        className="small"
                        onClick={() => onApprove(r)}
                      >
                        {t('candidates.requests.approve')}
                      </button>
                      <button
                        className="small danger"
                        onClick={() => onReject(r)}
                      >
                        {t('candidates.requests.reject')}
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
