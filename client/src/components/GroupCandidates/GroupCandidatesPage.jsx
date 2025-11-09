// client/src/pages/GroupCandidatesPage.jsx
import { useEffect, useState } from 'react';
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

  // ספינר/נעילה בזמן הצבעה
  const [isVoting, setIsVoting] = useState(false);

  // סטייטים מה-store
  const { selectedGroup: group, loading: groupLoading, error: groupError } = useSelector(s => s.groups);
  const isAuthed = useSelector(s => Boolean(s.auth?.token));

  // מועמדים
  const candidates   = useSelector(selectCandidatesForGroup(groupId));
  const candLoading  = useSelector(selectCandidatesLoadingForGroup(groupId));
  const candError    = useSelector(selectCandidatesErrorForGroup(groupId));

  // טעינת קבוצה + מועמדים
  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupOnly(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
  }, [dispatch, groupId]);

  // דגל נעילה מאוחד (מהשרת או מה-localStorage)
  const locked = Boolean(group?.hasVotedInGroup) || Boolean(localStorage.getItem(`voted:${groupId}`));

  const handleVote = async (candidateId) => {
    if (locked || isVoting) return;

    if (!isAuthed) {
      navigate('/login', { state: { redirectTo: location.pathname }, replace: true });
      return;
    }

    if (!window.confirm('האם לאשר הצבעה למועמד זה?')) return;

    try {
      setIsVoting(true);
      await dispatch(voteForCandidate({ groupId, candidateId })).unwrap();

      // שמירת נעילה מתמשכת לרענונים
      localStorage.setItem(`voted:${groupId}`, '1');

      // ריענון מיידי להצגת מוני קולות מעודכנים
      await dispatch(fetchCandidatesByGroup(groupId));
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Vote failed');
    } finally {
      setIsVoting(false);
    }
  };

  // מצבים כלליים
  if (groupLoading) return <div className="gc-wrap"><h2>מועמדים</h2><div>טוען...</div></div>;
  if (groupError)  return <div className="gc-wrap"><h2>מועמדים</h2><div className="err">{groupError}</div></div>;
  if (!group)      return <div className="gc-wrap"><h2>מועמדים</h2><div>לא נמצאה קבוצה.</div></div>;

  return (
    <div className="gc-wrap">
      <div className="gc-header">
        <h2>מועמדים</h2>
        <div className="gc-subtitle"><b>{group.name}</b> · מזהה: {group._id}</div>
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
        <ul className="gc-list">
          {candidates.map(c => (
            <li key={c._id} className="gc-row">
              <div className="gc-main">
                <div className="gc-title">
                  {c.name || '(ללא שם)'} {c.symbol ? `· ${c.symbol}` : ''}
                </div>
                {(c.description || c.photoUrl) && (
                  <div className="gc-sub">
                    {c.description || ''}{c.photoUrl ? ` · ${c.photoUrl}` : ''}
                  </div>
                )}
              </div>

              {c.description && <p style={{ margin: '10px 0 0', color: '#444' }}>{c.description}</p>}

              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={chip}>קולות: {c.votesCount ?? 0}</span>

                <button
                  style={{
                    ...voteBtn,
                    ...(locked || isVoting
                      ? { background: '#ccc', color: '#666', cursor: 'not-allowed', opacity: 0.9 }
                      : {}),
                  }}
                  onClick={() => handleVote(c._id)}
                  disabled={locked || isVoting}
                >
                  {locked ? 'כבר הצבעת' : isVoting ? 'מצביע/ה…' : 'הצבע/י'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// סגנונות קטנים בשורת קוד (אם אין בקובץ ה-CSS)
const chip    = { background: '#f6f6f6', border: '1px solid #e2e2e2', borderRadius: 999, padding: '4px 10px', fontSize: 12 };
const voteBtn = { background: '#0d47a1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' };
