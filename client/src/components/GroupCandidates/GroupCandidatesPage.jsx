// client/src/pages/GroupCandidatesPage.jsx
import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchGroupOnly } from '../../slices/groupsSlice';
import { voteForCandidate } from '../../slices/votesSlice';

import {
  fetchCandidatesByGroup,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup,
} from '../../slices/candidateSlice';

import './GroupCandidatesPage.css';

export default function GroupCandidatesPage() {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // state
  const { selectedGroup: group, loading: groupLoading, error: groupError } = useSelector(s => s.groups);
  const isAuthed = useSelector(s => Boolean(s.auth?.token));

  const candidates   = useSelector(selectCandidatesForGroup(groupId));
  const candLoading  = useSelector(selectCandidatesLoadingForGroup(groupId));
  const candError    = useSelector(selectCandidatesErrorForGroup(groupId));

  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupOnly(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
  }, [dispatch, groupId]);

  // voting flow
  const handleVote = async (candidateId) => {
    if (!isAuthed) {
      navigate('/login', {
        state: {
          redirectTo: location.pathname,
        },
        replace: true,
      });
      return;
    }

    if (!window.confirm('האם לאשר הצבעה למועמד זה?')) return;

    await dispatch(voteForCandidate({ groupId, candidateId }));
    alert('הצבעתך נקלטה בהצלחה!');
  };

  // loading & error states
  if (groupLoading) return <div className="gc-wrap"><h2>מועמדים</h2><div>טוען...</div></div>;
  if (groupError)  return <div className="gc-wrap"><h2>מועמדים</h2><div className="err">{groupError}</div></div>;
  if (!group)      return <div className="gc-wrap"><h2>מועמדים</h2><div>לא נמצאה קבוצה.</div></div>;

  return (
    <div className="gc-wrap">
      <div className="gc-header">
        <h2>מועמדים</h2>
        <div className="gc-subtitle">
          <b>{group.name}</b> · מזהה: {group._id}
        </div>
        <div className="gc-actions">
          <button className="gc-btn" onClick={() => navigate(`/groups/${groupId}/settings`)}>להגדרות הקבוצה</button>
          <button className="gc-btn-outline" onClick={() => navigate('/groups')}>לרשימת הקבוצות</button>
        </div>
      </div>

      {candLoading ? (
        <div>טוען מועמדים…</div>
      ) : candError ? (
        <div className="err">{candError}</div>
      ) : !candidates?.length ? (
        <div className="muted">אין מועמדים בקבוצה.</div>
      ) : (
        <div style={grid}>
          {candidates.map(c => (
            <div key={c._id} style={card}>
              <div style={{ display: 'flex', gap: 10 }}>
                {c.photoUrl ? (
                  <img
                    src={c.photoUrl}
                    alt={c.name || 'מועמד'}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                  />
                ) : (
                  <div style={avatar}>{(c.symbol || c.name || '?').slice(0, 2).toUpperCase()}</div>
                )}
                <div>
                  <h3 style={{ margin: '6px 0 4px' }}>{c.name || '(ללא שם)'}</h3>
                  {c.symbol && <div style={{ opacity: .8 }}>סמל: <b>{c.symbol}</b></div>}
                  {(c.description || c.photoUrl) && (
                    <div className="gc-sub">
                      {c.description || ''}{c.photoUrl ? ` · ${c.photoUrl}` : ''}
                    </div>
                  )}
                </div>
              </div>

              {c.description && <p style={{ margin: '10px 0 0', color: '#444' }}>{c.description}</p>}

              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={chip}>קולות: {c.votesCount ?? 0}</span>

                {/* כפתור ההצבעה */}
                <button style={voteBtn} onClick={() => handleVote(c._id)}>
                  הצבע/י
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const grid   = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 };
const card   = { border: '1px solid #e6e6e6', borderRadius: 14, padding: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', background: '#fff' };
const avatar = { width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #eee', background: '#f7f7f7', fontWeight: 700 };
const chip   = { background: '#f6f6f6', border: '1px solid #e2e2e2', borderRadius: 999, padding: '4px 10px', fontSize: 12 };
const voteBtn= { background: '#0d47a1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' };
