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

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#84cc16'];
const lc = (s) => (s || '').trim().toLowerCase();

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

  useEffect(() => {
    if (groupId) dispatch(fetchGroupWithMembers(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
    if (isAuthed) dispatch(fetchMyGroups());
  }, [dispatch, groupId, isAuthed]);

  // resize bar handlers
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

  if (groupLoading || !group) return <div className="loading-wrap">טוען נתוני קבוצה…</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);
  const sortedCandidates = [...candidates].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));

  const pieData = candidates.filter((c) => c.votesCount > 0).map((c) => ({ name: c.name, value: c.votesCount || 0 }));
  const barData = sortedCandidates.map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name,
    votesCount: c.votesCount || 0
  }));

  return (
    <div className="page-wrap dashboard">
      <div className="page-header">
        <h2 className="page-title">{group.name}</h2>
        <p className="group-description">{group.description}</p>
      </div>

      <div className="meta-and-button">
        <div className="group-meta">
          <div><span className="meta-label">📅 תאריך יצירה:</span><span className="meta-value">{formatDate(group.creationDate)}</span></div>
          <div><span className="meta-label">⏰ תאריך סיום:</span><span className="meta-value">{formatDate(group.endDate)}</span></div>
          <div><span className="meta-label">🗳️ סך הצבעות:</span><span className="meta-value">{totalVotes}</span></div>
        </div>

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
          🗳️ לכו להצביע
        </button>
      </div>

      {errorCandidates && <p className="err">❌ שגיאה: {errorCandidates}</p>}

      <div className="main-content-resizable" ref={containerRef} style={{ cursor: isDragging ? 'col-resize' : 'default' }}>
        <div className="left-section" style={{ width: `${leftWidth}%` }}>
          <div className="candidates-container">
            <h3 className="section-title">המועמדים</h3>
            {loadingCandidates && <p>טוען מועמדים...</p>}

            {!loadingCandidates && candidates.length > 0 && (
              <div className="candidates-grid">
                {sortedCandidates.map((c, idx) => (
                  <div key={c._id} className={`candidate-card ${idx === 0 && totalVotes > 0 ? 'leader' : ''}`}>
                    {idx === 0 && totalVotes > 0 && <div className="current-leader">🏆</div>}

                    {c.photoUrl ? (
                      <img src={c.photoUrl} alt={c.name} className="candidate-photo" />
                    ) : (
                      <div className="candidate-photo" style={{ background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: '#1e40af' }}>
                        👤
                      </div>
                    )}

                    <h4>{c.name}</h4>
                    {c.symbol && <span className="candidate-symbol">{c.symbol}</span>}
                    {c.description && <p>{c.description}</p>}
                    <div className="votes-count">{c.votesCount || 0} קולות</div>
                  </div>
                ))}
              </div>
            )}

            {!loadingCandidates && candidates.length === 0 && <p>אין מועמדים זמינים כרגע</p>}
          </div>
        </div>

        <div className="resize-handle" onMouseDown={() => setIsDragging(true)}>
          <div className="resize-line"></div>
        </div>

        <div className="right-section" style={{ width: `${100 - leftWidth}%` }}>
          {!loadingCandidates && candidates.length > 0 && totalVotes > 0 ? (
            <div className="charts">
              <div className="pie-chart-container">
                <h3>📊 אחוזי הצבעה</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="60%"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} קולות`} />
                      <Legend verticalAlign="bottom" height={25} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bar-chart-container">
                <h3>📈 מספר קולות</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 35 }}>
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} interval={0} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `${v} קולות`} cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
                      <Bar dataKey="votesCount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            !loadingCandidates &&
            candidates.length > 0 && <div className="no-votes-message">🕐 אין הצבעות עדיין — ברגע שיתקבלו קולות, הגרפים יוצגו כאן</div>
          )}
        </div>
      </div>
    </div>
  );
}
