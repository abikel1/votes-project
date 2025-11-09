import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { fetchGroupOnly } from '../../slices/groupsSlice';
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

  const { selectedGroup: group, loading: groupLoading, error: groupError } = useSelector(s => s.groups);
  const candidates = useSelector(selectCandidatesForGroup(groupId));
  const candLoading = useSelector(selectCandidatesLoadingForGroup(groupId));
  const candError = useSelector(selectCandidatesErrorForGroup(groupId));

  useEffect(() => {
    dispatch(fetchGroupOnly(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
  }, [dispatch, groupId]);

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
