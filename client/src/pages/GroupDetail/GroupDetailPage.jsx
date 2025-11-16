import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchMyGroups,
  fetchGroupWithMembers,
  selectMyJoinedIds
} from '../../slices/groupsSlice';

import {
  fetchCandidatesByGroup,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup
} from '../../slices/candidateSlice';

import './GroupDetailPage.css';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// צבעים לגרפים
const COLORS = ['#003366', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#84cc16'];

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedGroup: group, loading: groupLoading } = useSelector(s => s.groups);

  const candidates = useSelector(selectCandidatesForGroup(groupId));
  const loadingCandidates = useSelector(selectCandidatesLoadingForGroup(groupId));
  const errorCandidates = useSelector(selectCandidatesErrorForGroup(groupId));

  const { userEmail: authEmail, userId: authId } = useSelector((s) => s.auth);
  const isAuthed = !!authId || !!authEmail || !!localStorage.getItem('authToken');

  const myJoinedIdsSet = useSelector(selectMyJoinedIds);

  const [leftWidth, setLeftWidth] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // טוען נתונים
  useEffect(() => {
    if (groupId) dispatch(fetchGroupWithMembers(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
    if (isAuthed) dispatch(fetchMyGroups());
  }, [dispatch, groupId, isAuthed]);

  // חישוב אם עבר תאריך סיום
  const isExpired = group?.endDate ? new Date(group.endDate) < new Date() : false;

  // Resize bar
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const v = 100 - ((e.clientX - rect.left) / rect.width) * 100;
      if (v >= 25 && v <= 60) setLeftWidth(v);
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (groupLoading || !group)
    return <div className="loading-wrap">טוען נתוני קבוצה…</div>;

  // פונקציות עזר
  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  // נתוני הצבעות
  const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);
  const sortedCandidates = [...candidates].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));

  const pieData = candidates
    .filter((c) => c.votesCount > 0)
    .map((c) => ({ name: c.name, value: c.votesCount || 0 }));

  const barData = sortedCandidates.map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name,
    votesCount: c.votesCount || 0
  }));

  // מציאת זוכים לפי maxWinners
  const winners = sortedCandidates.slice(0, group.maxWinners);
  const maxVotes = Math.max(...candidates.map(c => c.votesCount || 0));

  return (
    <div className="page-wrap dashboard">

      {/* כותרת */}
      <div className="page-header">

        {/* כפתור חזרה לעמוד קבוצות */}
        <button
          className="back-btn"
          onClick={() => navigate('/groups')}
        >
          כל הקבוצות  </button>

        <h2 className="page-title">{group.name}</h2>
        <p className="group-description">{group.description}</p>
      </div>

      {/* מידע על הקבוצה */}
      <div className="meta-and-button">
        <div className="group-meta">
          <div><span className="meta-label">תאריך יצירה:</span> <span className="meta-value">{formatDate(group.creationDate)}</span></div>
          <div><span className="meta-label">תאריך סיום:</span> <span className="meta-value">{formatDate(group.endDate)}</span></div>
          <div><span className="meta-label">סך הצבעות:</span> <span className="meta-value">{totalVotes}</span></div>
        </div>

        {/* כפתור הצבעה — רק לפני סיום */}
        {!isExpired && (
          <button
            className="vote-btn"
            onClick={() => {
              if (!isAuthed) {
                const goLogin = window.confirm('אינך מחובר/ת. כדי להצביע צריך להתחבר. לעבור למסך ההתחברות?');
                if (goLogin) navigate('/login', { state: { redirectTo: `/groups/${groupId}/candidates` } });
                return;
              }
              navigate(`/groups/${groupId}/candidates`);
            }}
          >
            להצבעה בקלפי
          </button>
        )}
      </div>

      {errorCandidates && <p className="err">❌ שגיאה: {errorCandidates}</p>}

      <div className="main-content-resizable" ref={containerRef}>

        {/* צד שמאל – מועמדים */}
        <div className="left-section" style={{ width: `${leftWidth}%` }}>
          <div className="candidates-container">
            <h3 className="section-title">המועמדים</h3>

            {loadingCandidates && <p>טוען מועמדים...</p>}

            {!loadingCandidates && candidates.length > 0 && (
              <div className="candidates-grid">

                {sortedCandidates.map((c) => {
                  const isWinner = winners.some((w) => w._id === c._id);

                  return (
                    <div
                      key={c._id}
                      className={`candidate-card ${isWinner ? "winner" : ""}`}
                    >

                      {/* גביע יוצג רק אם הסתיים */}
                      {isExpired && isWinner && (
                        <div className="current-leader">
                          <img src="/src/assets/icons/trophy.png" className="groups-badge-locked" />
                        </div>
                      )}

                      <h4>{c.name}</h4>
                      {c.description && <p>{c.description}</p>}

                      {/* מספר קולות יוצג לכל מועמד רק אם הסתיים */}
                      {isExpired && (
                        <div className="votes-count">{c.votesCount || 0} קולות</div>
                      )}

                    </div>
                  );
                })}

              </div>
            )}

            {!loadingCandidates && candidates.length === 0 && <p>אין מועמדים</p>}
          </div>
        </div>

        {/* פס גרירה */}
        <div className="resize-handle" onMouseDown={() => setIsDragging(true)}>
          <div className="resize-line"></div>
        </div>

        {/* צד ימין – גרפים */}
        <div className="right-section" style={{ width: `${100 - leftWidth}%` }}>

          {!isExpired && (
            <div className="group-details">

              {/* תיאור הקבוצה */}
              <div className="group-description">
                <h3>תיאור הקבוצה</h3>
                <p>{group?.description || "אין תיאור לקבוצה הזו."}</p>
              </div>



              {/* כפתור מעבר לעמוד הסקר */}
              <button
                className="go-to-survey-btn"
                onClick={() => navigate(`/groups/${groupId}/candidates`)}
              >
                עבור לסקר
              </button>

            </div>
          )}


          {/* אחרי סיום — מציג גרפים */}
          {isExpired && totalVotes > 0 && (
            <div className="charts">
              <div className="pie-chart-container">
                <h3>אחוזי הצבעה</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="60%">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} קולות`} />
                      <Legend verticalAlign="bottom" height={25} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bar-chart-container">
                <h3>מספר קולות</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} interval={0} />
                      <YAxis />
                      <Tooltip formatter={(v) => `${v} קולות`} />
                      <Bar dataKey="votesCount" fill="#003366" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {isExpired && totalVotes === 0 && (
            <div className="no-votes-message">
              🕐 אין הצבעות — לא ניתן להציג גרפים
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
