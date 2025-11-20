// src/pages/GroupDetail/GroupDetailPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiClock, HiUserGroup, HiUser, HiOutlineBadgeCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

import {
  fetchMyGroups,
  fetchGroupWithMembers,
  selectMyJoinedIds,
} from '../../slices/groupsSlice';

import {
  fetchCandidatesByGroup,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup,
} from '../../slices/candidateSlice';

import './GroupDetailPage.css';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import http from '../../api/http';

// צבעים לגרפים
const COLORS = [
  '#003366',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#84cc16',
];

const makeSlug = (name = '') =>
  encodeURIComponent(
    String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-'),
  );

export default function GroupDetailPage() {
  const { groupSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const navGroupId = location.state?.groupId || null;
  const [groupId, setGroupId] = useState(navGroupId);

  const { selectedGroup: group, loading: groupLoading, error: groupError } = useSelector(
    (s) => s.groups,
  );
  const candidates = useSelector(selectCandidatesForGroup(groupId || '')) || [];
  const loadingCandidates = useSelector(selectCandidatesLoadingForGroup(groupId || ''));
  const errorCandidates = useSelector(selectCandidatesErrorForGroup(groupId || ''));

  const joinedIdsSet = useSelector(selectMyJoinedIds);

  const { userEmail: authEmail, userId: authId } = useSelector((s) => s.auth);
  const isAuthed = !!authId || !!authEmail;

  const [leftWidth, setLeftWidth] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // אם נכנסו עם /groups/:groupSlug בלי state – נטען id מהשרת לפי slug
  useEffect(() => {
    if (navGroupId) {
      setGroupId(navGroupId);
      return;
    }
    if (!groupSlug) return;

    (async () => {
      try {
        const { data } = await http.get(`/groups/slug/${groupSlug}`);
        setGroupId(data._id);
      } catch (err) {
        console.error('failed to resolve group by slug', err);
        setGroupId(null);
      }
    })();
  }, [navGroupId, groupSlug]);

  // טוען נתוני קבוצה ומועמדים
  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupWithMembers(groupId));
      dispatch(fetchCandidatesByGroup(groupId));
    }
    if (isAuthed) {
      dispatch(fetchMyGroups());
    }
  }, [dispatch, groupId, isAuthed]);

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

  if (groupError) {
    return (
      <div className="group-detail-error">
        שגיאה בטעינת הקבוצה.
        <button
          className="group-detail-back-btn"
          onClick={() => navigate('/groups')}
        >
          חזרה לרשימת הקבוצות
        </button>
      </div>
    );
  }

  if (!groupId) {
    return <div className="loading-wrap">טוען נתוני קבוצה…</div>;
  }

  if (groupLoading || !group) {
    return <div className="loading-wrap">טוען נתוני קבוצה…</div>;
  }

  // ---- חישובי הרשאות אחרי שיש group ----
  const gidStr = String(group._id);
  const slug = makeSlug(group.name || groupSlug || gidStr);
  const isLocked = !!group.isLocked;

  const myEmail = (authEmail || localStorage.getItem('userEmail') || '')
    .trim()
    .toLowerCase();
  const myId = String(authId ?? localStorage.getItem('userId') ?? '');

  const createdByEmail = (
    group.createdBy ??
    group.created_by ??
    group.createdByEmail ??
    group.ownerEmail ??
    group.owner ??
    ''
  )
    .trim()
    .toLowerCase();
  const createdById = String(group.createdById ?? '');

  const isOwner =
    !!group.isOwner ||
    (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
    (!!myId && !!createdById && myId === createdById);

  const isMember =
    !!joinedIdsSet && typeof joinedIdsSet.has === 'function' && joinedIdsSet.has(gidStr);

  const isExpired = group?.endDate ? new Date(group.endDate) < new Date() : false;

  // 🔒 קבוצה נעולה + לא מחובר כלל
  if (isLocked && !isAuthed) {
    return (
      <div className="page-wrap dashboard">
        <div className="page-header">
          <button
            className="back-btn"
            onClick={() => navigate('/groups')}
          >
            כל הקבוצות
          </button>

          <h2 className="page-title">קבוצה נעולה</h2>
          <p className="group-description">
            קבוצה זו נעולה. כדי לבקש הצטרפות עליה יש להתחבר למערכת ולאחר מכן לשלוח
            בקשת הצטרפות מעמוד &quot;קבוצות&quot;.
          </p>
        </div>

        <div className="meta-and-button">
          <button
            className="vote-btn"
            onClick={() =>
              navigate('/login', {
                state: {
                  from: `/groups/${slug}`,
                  joinGroupId: gidStr,
                },
              })
            }
          >
            בקשת הצטרפות
          </button>
        </div>
      </div>
    );
  }

  // 🔒 קבוצה נעולה + משתמש מחובר אבל *לא* חבר בקבוצה (ולא מנהלת)
  if (isLocked && isAuthed && !isOwner && !isMember) {
    return (
      <div className="page-wrap dashboard">
        <div className="page-header">
          <button
            className="back-btn"
            onClick={() => navigate('/groups')}
          >
            כל הקבוצות
          </button>

          <h2 className="page-title">קבוצה נעולה</h2>
          <p className="group-description">
            אינך מחובר/ת לקבוצה זו. כדי להצטרף, חזור/י לעמוד הקבוצות ולחץ/י על
            &quot;בקשת הצטרפות&quot; בקבוצה המתאימה.
          </p>
        </div>
      </div>
    );
  }

  // ---- מכאן והלאה: או קבוצה פתוחה, או נעולה שהמשתמש חבר/מנהלת ----

  const goSettings = () => {
    navigate(`/groups/${slug}/settings`, {
      state: { groupId },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);
  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.votesCount || 0) - (a.votesCount || 0),
  );

  const pieData = candidates
    .filter((c) => c.votesCount > 0)
    .map((c) => ({ name: c.name, value: c.votesCount || 0 }));

  const barData = sortedCandidates.map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name,
    votesCount: c.votesCount || 0,
  }));

  const winners = sortedCandidates.slice(0, group.maxWinners);
  const maxVotes = Math.max(...candidates.map((c) => c.votesCount || 0));

  return (
    <div className="page-wrap dashboard">
      {/* כותרת */}
      <div className="page-header">
        <button
          className="back-btn"
          onClick={() => navigate('/groups')}
        >
          כל הקבוצות
        </button>

        {isOwner && (
          <button
            className="group-settings-btn-left"
            onClick={goSettings}
            title="הגדרות קבוצה"
          >
            <img src="/src/assets/icons/settings.png" alt="הגדרות" />
          </button>
        )}

        <h2 className="page-title">{group.name}</h2>
        <p className="group-description">{group.description}</p>
      </div>

      {/* מידע על הקבוצה */}
      <div className="meta-and-button">
        <div className="group-meta">
          <div>
            <span className="meta-label">תאריך יצירה:</span>
            <span className="meta-value">{formatDate(group.creationDate)}</span>
          </div>
          <div>
            <span className="meta-label">תאריך סיום:</span>
            <span className="meta-value">{formatDate(group.endDate)}</span>
          </div>
          <div>
            <span className="meta-label">סך הצבעות:</span>
            <span className="meta-value">{totalVotes}</span>
          </div>
        </div>

        {!isExpired && (
          <button
            className="vote-btn"
            onClick={() => {
              if (!isAuthed) {
                toast.error('אינך מחובר/ת. כדי להצביע צריך להתחבר.');
                return;
              }

              navigate(`/groups/${slug}/candidates`, {
                state: { groupId },
              });
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
                      className={`candidate-card ${isWinner ? 'winner' : ''}`}
                    >
                      {isExpired && isWinner && (
                        <div className="current-leader">
                          <img
                            src="/src/assets/icons/trophy.png"
                            className="groups-badge-locked"
                          />
                        </div>
                      )}

                      <div className="candidate-header">
                        {c.photoUrl && (
                          <img
                            src={c.photoUrl}
                            alt={c.name || 'תמונת מועמד'}
                            className="candidate-avatar"
                          />
                        )}
                        <div className="candidate-text">
                          <h4>{c.name}</h4>
                          {c.description && <p>{c.description}</p>}
                        </div>
                      </div>

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
        <div
          className="resize-handle"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="resize-line" />
        </div>

        {/* צד ימין – מידע / גרפים */}
        <div
          className="right-section"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {!isExpired && (
            <div className="group-details-card">
              <div className="group-header">
                <h2>{group.name}</h2>
                <p>{group.description || 'אין תיאור לקבוצה הזו.'}</p>
              </div>

              <div className="group-info-grid">
                <div className="info-card">
                  <HiClock size={28} color="#1e3a8a" />
                  <p>זמן עד סיום</p>
                  <h4>
                    {Math.max(
                      Math.floor(
                        (new Date(group.endDate) - new Date()) / (1000 * 60 * 60 * 24),
                      ),
                      0,
                    )}{' '}
                    ימים
                  </h4>
                </div>
                <div className="info-card">
                  <HiUserGroup size={28} color="#1e3a8a" />
                  <p>סך הצבעות</p>
                  <h4>{totalVotes}</h4>
                </div>
                <div className="info-card">
                  <HiUser size={28} color="#1e3a8a" />
                  <p>מספר מועמדים</p>
                  <h4>{candidates.length}</h4>
                </div>
                <div className="info-card">
                  <HiOutlineBadgeCheck size={28} color="#1e3a8a" />
                  <p>מספר מקומות לזוכים</p>
                  <h4>{group.maxWinners}</h4>
                </div>
              </div>
            </div>
          )}

          {isExpired && totalVotes > 0 && (
            <div className="charts">
              <div className="pie-chart-container">
                <h3>אחוזי הצבעה</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} קולות`} />
                    <Legend verticalAlign="bottom" height={25} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bar-chart-container">
                <h3>מספר קולות</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip formatter={(v) => `${v} קולות`} />
                    <Bar dataKey="votesCount" fill="#003366" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {isExpired && totalVotes === 0 && (
            <div className="no-votes-message">🕐 אין הצבעות — לא ניתן להציג גרפים</div>
          )}
        </div>
      </div>
    </div>
  );
}
