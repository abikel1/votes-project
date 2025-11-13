import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGroups,
  fetchMyGroups,
  selectGroupsWithOwnership,
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

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#6366f1', '#84cc16'
];

const lc = (s) => (s || '').trim().toLowerCase();

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const groups = useSelector(selectGroupsWithOwnership);
  const candidates = useSelector(selectCandidatesForGroup(groupId));
  const loadingCandidates = useSelector(selectCandidatesLoadingForGroup(groupId));
  const errorCandidates = useSelector(selectCandidatesErrorForGroup(groupId));

  // סטטוס התחברות
  const { userEmail: authEmail, userId: authId } = useSelector((s) => s.auth);
  const isAuthed = !!authId || !!authEmail || !!localStorage.getItem('authToken');

  // סט קבוצות שאני חברה בהן
  const myJoinedIdsSet = useSelector(selectMyJoinedIds);

  const [leftWidth, setLeftWidth] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // טוען נתונים
  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchCandidatesByGroup(groupId));
    if (isAuthed) {
      dispatch(fetchMyGroups());
    }
  }, [dispatch, groupId, isAuthed]);

  // Drag handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newLeftWidth = 100 - ((e.clientX - rect.left) / rect.width) * 100;

      if (newLeftWidth >= 25 && newLeftWidth <= 60) {
        setLeftWidth(newLeftWidth);
      }
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

  // מצא קבוצה (יכול להיות undefined ברנדר ראשון)
  const group = groups.find(g => g._id === groupId);

  // Guard על כניסה ישירה לקבוצה נעולה
  useEffect(() => {
    if (!group) return;

    const isLocked = !!group.isLocked;
    if (!isLocked) return;

    const myEmail = lc(authEmail) || lc(localStorage.getItem('userEmail'));
    const myId = String(authId ?? localStorage.getItem('userId') ?? '');

    const createdByEmail = lc(group.createdBy ?? group.created_by ?? group.createdByEmail ?? group.ownerEmail ?? group.owner);
    const createdById = String(group.createdById ?? '');
    const isOwner =
      !!group.isOwner ||
      (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
      (!!myId && !!createdById && myId === createdById);

    // אם הקבוצה נעולה והמשתמשת לא מחוברת — חוסמים מיד
    if (!isOwner && !isAuthed) {
      navigate('/groups', { replace: true });
      return;
    }

    // אם מחוברת ולא בעלים — נבדוק חברות מול השרת; אם לא חברה → נחסום
    const checkMembership = async () => {
      try {
        // משתמשת בקוד ה-HTTP שלך (אותו http שבו השתמשת בקבצים אחרים)
        const { data } = await import('../../api/http').then(m => m.default.get(`/groups/${groupId}/my-membership`));
        const serverMember = !!data?.member;

        const clientMember = myJoinedIdsSet.has(String(groupId));
        const isMember = serverMember || clientMember;

        if (!isOwner && !isMember) {
          navigate('/groups', { replace: true });
        }
      } catch (err) {
        // אם השרת מחזיר 401/403 — אין גישה; נחסום
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          navigate('/groups', { replace: true });
          return;
        }
        // אם לא הצלחנו לדעת — ליתר ביטחון חוסמים
        navigate('/groups', { replace: true });
      }
    };

    if (!isOwner) {
      checkMembership();
    }
  }, [group, authEmail, authId, isAuthed, myJoinedIdsSet, groupId, navigate]);

  if (!group) return <div className="loading-wrap">טוען נתונים...</div>;

  // פונקציה לעיצוב תאריכים
  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);
  const sortedCandidates = [...candidates].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));

  const pieData = candidates
    .filter(c => c.votesCount > 0)
    .map(c => ({ name: c.name, value: c.votesCount || 0 }));

  const barData = sortedCandidates.map(c => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name,
    votesCount: c.votesCount || 0
  }));
const maxVotes = Math.max(...candidates.map(c => c.votesCount || 0));

  console.log('Charts Debug:', {
    pieData,
    barData,
    totalVotes,
    candidatesLength: candidates.length
  });

  return (
    <div className="page-wrap dashboard">
      <div className="page-header">
        <h2 className="page-title">{group.name}</h2>
        <p className="group-description">{group.description}</p>
      </div>

      <div className="meta-and-button">
        <div className="group-meta">
          <div>
            <span className="meta-label">📅 תאריך יצירה:</span>
            <span className="meta-value">{formatDate(group.creationDate)}</span>
          </div>
          <div>
            <span className="meta-label">⏰ תאריך סיום:</span>
            <span className="meta-value">{formatDate(group.endDate)}</span>
          </div>
          <div>
            <span className="meta-label">🗳️ סך הצבעות:</span>
            <span className="meta-value">{totalVotes}</span>
          </div>
        </div>

        <button
          className="vote-btn"
          onClick={() => {
            if (!isAuthed) {
              const goLogin = window.confirm('אינך מחובר/ת. כדי להצביע צריך להתחבר. לעבור למסך ההתחברות?');
              if (goLogin) {
                navigate('/login', { state: { redirectTo: `/groups/${groupId}/candidates` } });
              }
              return;
            }
            navigate(`/groups/${groupId}/candidates`);
          }}
        >
          🗳️ לכו להצביע
        </button>
      </div>

      {errorCandidates && <p className="err">❌ שגיאה: {errorCandidates}</p>}

      <div
        className="main-content-resizable"
        ref={containerRef}
        style={{ cursor: isDragging ? 'col-resize' : 'default' }}
      >
        <div className="left-section" style={{ width: `${leftWidth}%` }}>
          <div className="candidates-container">
            <h3 className="section-title">המועמדים</h3>
            {loadingCandidates && <p>טוען מועמדים...</p>}

            {!loadingCandidates && candidates.length > 0 && (
              <div className="candidates-grid">
             {sortedCandidates.map((c, idx) => {
  const isLeader = (c.votesCount || 0) === maxVotes && totalVotes > 0;
  return (
    <div
      key={c._id}
      className={`candidate-card ${isLeader ? 'leader' : ''}`}
    >
      {isLeader && <div className="current-leader">🏆</div>}

      {c.photoUrl ? (
        <img src={c.photoUrl} alt={c.name} className="candidate-photo" />
      ) : (
        <div
          className="candidate-photo"
          style={{
            background: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            color: '#1e40af'
          }}
        >
          👤
        </div>
      )}

      <h4>{c.name}</h4>
      {c.symbol && <span className="candidate-symbol">{c.symbol}</span>}
      {c.description && <p>{c.description}</p>}
      <div className="votes-count">{c.votesCount || 0} קולות</div>
    </div>
  );
})}

              </div>
            )}

            {!loadingCandidates && candidates.length === 0 && (
              <p>אין מועמדים זמינים כרגע</p>
            )}
          </div>
        </div>

        <div
          className="resize-handle"
          onMouseDown={() => setIsDragging(true)}
        >
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
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="60%"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} קולות`} />
                      <Legend
                        verticalAlign="bottom"
                        height={25}
                        wrapperStyle={{ fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bar-chart-container">
                <h3>📈 מספר קולות</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 35 }}>
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={50}
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => `${value} קולות`}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Bar dataKey="votesCount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            !loadingCandidates &&
            candidates.length > 0 && (
              <div className="no-votes-message">
                🕐 אין הצבעות עדיין — ברגע שיתקבלו קולות, הגרפים יוצגו כאן
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
