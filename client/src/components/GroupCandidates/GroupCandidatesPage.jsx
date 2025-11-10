// client/src/pages/GroupCandidatesPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { fetchGroupOnly } from '../../slices/groupsSlice';
import {
  fetchCandidatesByGroup,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup,
  optimisticIncVote, // ← חשוב: אינקרמנט אופטימי
} from '../../slices/candidateSlice';
import { voteForCandidate } from '../../slices/votesSlice';

import './GroupCandidatesPage.css';

export default function GroupCandidatesPage() {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [hasVotedHere, setHasVotedHere] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const { selectedGroup: group, loading: groupLoading, error: groupError } = useSelector(s => s.groups);
  const candidates = useSelector(selectCandidatesForGroup(groupId));
  const candLoading = useSelector(selectCandidatesLoadingForGroup(groupId));
  const candError = useSelector(selectCandidatesErrorForGroup(groupId));
  const isAuthed = useSelector(s => Boolean(s.auth?.token));
  const userId = useSelector(s => s.auth?.userId || null);

  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupOnly(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
  }, [dispatch, groupId]);

  // מיגרציה: אם פעם נשמר מפתח ישן (voted:<groupId>) – נהפוך לחדש (voted:<groupId>:<userId>)
  useEffect(() => {
    if (!groupId || !userId) {
      setHasVotedHere(false);
      return;
    }
    const legacyKey = `voted:${groupId}`;
    const newKey = `voted:${groupId}:${userId}`;
    const legacy = localStorage.getItem(legacyKey);
    const modern = localStorage.getItem(newKey);

    if (modern) {
      setHasVotedHere(true);
      return;
    }
    if (legacy) {
      localStorage.setItem(newKey, '1');
      localStorage.removeItem(legacyKey);
      setHasVotedHere(true);
      return;
    }
    setHasVotedHere(false);
  }, [groupId, userId]);

  const handleVote = async (candidateId) => {
    if (hasVotedHere || isVoting) return;

    if (!isAuthed) {
      navigate('/login', { state: { redirectTo: location.pathname }, replace: true });
      return;
    }

    if (!window.confirm('להצביע למועמד הזה?')) return;

    try {
      setIsVoting(true);

      // אינקרמנט אופטימי (מציג עלייה מיידית במסך)
      dispatch(optimisticIncVote({ groupId, candidateId, delta: 1 }));

      // קריאה לשרת
      await dispatch(voteForCandidate({ groupId, candidateId })).unwrap();

      // נעילה לפי משתמש+קבוצה
      if (userId) localStorage.setItem(`voted:${groupId}:${userId}`, '1');
      setHasVotedHere(true);
      await dispatch(fetchCandidatesByGroup(groupId));
    } catch (e) {
      // אופציונלי: אם זו שגיאה אמיתית (לא "כבר הצבעת") – גלגול אחורה
      const msg = String(e || '');
      if (!msg.includes('already voted') && !msg.includes('כבר הצבעת')) {
        dispatch(optimisticIncVote({ groupId, candidateId, delta: -1 }));
      } else {
        if (userId) localStorage.setItem(`voted:${groupId}:${userId}`, '1');
        setHasVotedHere(true);
      }
    } finally {
      setIsVoting(false);
    }
  };

  if (groupLoading) return <div className="gc-wrap"><h2>מועמדים</h2><div>טוען...</div></div>;
  if (groupError) return <div className="gc-wrap"><h2>מועמדים</h2><div className="err">{groupError}</div></div>;
  if (!group) return <div className="gc-wrap"><h2>מועמדים</h2><div>לא נמצאה קבוצה.</div></div>;

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

              <div className="gc-actions">
                <span className="gc-chip">קולות: {c.votesCount ?? 0}</span>
                <button
                  className="gc-btn"
                  style={hasVotedHere || isVoting ? { background: '#ccc', color: '#666', cursor: 'not-allowed', opacity: 0.9 } : undefined}
                  disabled={hasVotedHere || isVoting}
                  onClick={() => handleVote(c._id)}
                >
                  {hasVotedHere ? 'כבר הצבעת' : isVoting ? 'מצביע/ה…' : 'הצבע/י'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
