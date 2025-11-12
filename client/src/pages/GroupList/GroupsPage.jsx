import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchGroups,
  fetchMyGroups,
  selectMyJoinedIds,
  selectMyCreatedIds,
} from '../../slices/groupsSlice';
import {
  requestJoinGroup,
  markJoinedLocally,
  fetchMyJoinStatuses,
  selectMyPendingSet,
  hydratePendingFromLocalStorage,
  clearRemovedNotice, // לא להראות שוב "הוסרת"
  selectMyRejectedSet, // ← חדש
} from '../../slices/joinRequestsSlice';
import http from '../../api/http';
import './GroupsPage.css';
import { useState } from 'react';

function formatDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return d;
  }
}

const lc = (s) => (s || '').trim().toLowerCase();

export default function GroupsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error: err, list: groups } = useSelector((s) => s.groups);
  const { userEmail: authEmail, userId: authId } = useSelector((s) => s.auth);

  const joinedIdsSet  = useSelector(selectMyJoinedIds);
  const pendingIdsSet = useSelector(selectMyPendingSet);
  const rejectedIdsSet = useSelector(selectMyRejectedSet); // ← חדש
  const createdIdsSet = useSelector(selectMyCreatedIds);
const [searchTerm, setSearchTerm] = useState('');
const [filter, setFilter] = useState('all');
const [showFilters, setShowFilters] = useState(false);
const [sortBy, setSortBy] = useState('creationDate');

  // מפת "הוסרת"
  const removedMap = useSelector((s) => s.joinReq.removedNotice || {});

  // 1) לשחזר pending מ-LS לפני שהשרת עונה
  useEffect(() => { dispatch(hydratePendingFromLocalStorage()); }, [dispatch]);

  // 2) טעינה ראשונית
  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchMyGroups());
    dispatch(fetchMyJoinStatuses());
  }, [dispatch]);

  // 3) פולינג עדין
  useEffect(() => {
    const t = setInterval(() => {
      dispatch(fetchMyGroups());
      dispatch(fetchMyJoinStatuses());
    }, 5000);
    return () => clearInterval(t);
  }, [dispatch]);

  // 4) רענון כשחוזרים לפוקוס
  useEffect(() => {
    const refresh = () => {
      dispatch(fetchMyGroups());
      dispatch(fetchMyJoinStatuses());
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh();
    });
    return () => { window.removeEventListener('focus', refresh); };
  }, [dispatch]);

  // 5) אם מזהים חברות — מסמנים מקומית
  useEffect(() => {
    for (const gid of joinedIdsSet) {
      dispatch(markJoinedLocally(String(gid)));
    }
  }, [dispatch, joinedIdsSet]);

  if (loading) return <div className="loading-wrap">טוען קבוצות...</div>;
  if (err) return <div className="error">{err}</div>;
  if (!groups?.length) return <div className="empty">אין קבוצות עדיין.</div>;

  const myEmail = lc(authEmail) || lc(localStorage.getItem('userEmail'));
  const myId = String(authId ?? localStorage.getItem('userId') ?? '');


const filteredGroups = groups
  .filter((g) => {
    const gid = String(g._id);
    const nameMatch = g.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!nameMatch) return false;

    const isLocked = !!g.isLocked;
    const isOwner = createdIdsSet.has(gid);
    const isMember = joinedIdsSet.has(gid);

    switch (filter) {
      case 'open':
        return !isLocked;
      case 'locked':
        return isLocked;
      case 'joined':
        return isMember;
      case 'owned':
        return isOwner;
      default:
        return true;
    }
  })
  .sort((a, b) => {
    if (sortBy === 'creationDate')
      return new Date(b.creationDate) - new Date(a.creationDate);
    if (sortBy === 'endDate')
      return new Date(a.endDate) - new Date(b.endDate);
    if (sortBy === 'name')
      return a.name.localeCompare(b.name, 'he');
    return 0;
  });


  return (
    <div className="page-wrap">
      <h2 className="page-title">כל הקבוצות</h2>
      {/* 🔍 סרגל סינון ומיון */}
{/* 🎛️ סרגל סינון ומיון */}
<div className="filter-bar">
  <input
    type="text"
    placeholder="חיפוש קבוצות..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />

  <div className="filter-controls">
    <button
      className="filter-toggle"
      onClick={() => setShowFilters((v) => !v)}
    >
      ⚙️ סינון
    </button>

    <select
      className="sort-select"
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
    >
      <option value="creationDate">תאריך יצירה (חדש קודם)</option>
      <option value="endDate">תאריך סיום (מוקדם קודם)</option>
      <option value="name">שם קבוצה (א-ת)</option>
    </select>
  </div>

  {showFilters && (
    <div className="filters-dropdown">
      <label>
        <input
          type="radio"
          name="filter"
          value="all"
          checked={filter === 'all'}
          onChange={(e) => setFilter(e.target.value)}
        />
        כל הקבוצות
      </label>

      <label>
        <input
          type="radio"
          name="filter"
          value="open"
          checked={filter === 'open'}
          onChange={(e) => setFilter(e.target.value)}
        />
        פתוחות
      </label>

      <label>
        <input
          type="radio"
          name="filter"
          value="locked"
          checked={filter === 'locked'}
          onChange={(e) => setFilter(e.target.value)}
        />
        נעולות
      </label>

      <label>
        <input
          type="radio"
          name="filter"
          value="joined"
          checked={filter === 'joined'}
          onChange={(e) => setFilter(e.target.value)}
        />
        קבוצות שאני מחוברת אליהן
      </label>

      <label>
        <input
          type="radio"
          name="filter"
          value="owned"
          checked={filter === 'owned'}
          onChange={(e) => setFilter(e.target.value)}
        />
        קבוצות שאני מנהלת
      </label>
    </div>
  )}
</div>


      <div className="groups-grid">
        {filteredGroups.map((g) => {
          const gid = String(g._id);
          const isLocked = !!g.isLocked;

          // בעלות (ללא hooks)
          const createdByEmail = lc(g.createdBy ?? g.created_by ?? g.createdByEmail ?? g.ownerEmail ?? g.owner);
          const createdById = String(g.createdById ?? '');
          const isOwner =
            !!g.isOwner ||
            (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
            (!!myId && !!createdById && myId === createdById);

          const isMember   = joinedIdsSet.has(gid);
          const isPending  = pendingIdsSet.has(gid);
          const isRejected = rejectedIdsSet.has(gid); // ← חדש
          const wasRemoved = !!removedMap[gid];

          const goSettings = (e) => { e.stopPropagation(); navigate(`/groups/${gid}/settings`); };

          const onRequestJoin = (e) => {
            e.stopPropagation();
            if (isMember || isPending) return;
            dispatch(clearRemovedNotice(gid)); // לא להראות שוב את ההודעה אחרי בקשה חדשה
            dispatch(requestJoinGroup(gid)).unwrap().catch(() => {});
          };

          // בזמן "בהמתנה" — בדיקת חברוּת מול השרת
          const onCardClick = async () => {
            if (!isOwner && isLocked && isPending && !isMember) {
              try {
                const { data } = await http.get(`/groups/${gid}/my-membership`);
                if (data?.member) {
                  dispatch(markJoinedLocally(gid));
                  navigate(`/groups/${gid}`);
                  return;
                }
              } catch {}
              alert('עדיין אינך מחובר/ת לקבוצה. הבקשה בהמתנה לאישור מנהל/ת.');
              return;
            }

            if (!isOwner && isLocked && !isMember) {
              if (isRejected) {
                alert('בקשתך נדחתה על ידי מנהל/ת הקבוצה. ניתן לשלוח בקשה חדשה.');
                return;
              }
              // סגור/הוסרה/לא חבר/ה
              return;
            }

            navigate(`/groups/${gid}`);
          };

          const cardDisabled = (!isOwner && isLocked && ((isPending && !isMember) || (!isPending && !isMember)));

          return (
            <article
              key={gid}
              onClick={onCardClick}
              className={`group-card ${cardDisabled ? 'card-disabled' : ''}`}
              title={cardDisabled ? 'אין גישה לקבוצה כרגע' : undefined}
            >
              <header className="card-header">
                <h3 className="card-title">{g.name}</h3>

                <div className="card-actions">
                  <span className="badge">מקס׳ זוכים: <b>{g.maxWinners ?? 1}</b></span>
                  {isLocked && <span className="chip">🔒</span>}
                  {isOwner && (
                    <button
                      className="gear-btn"
                      onClick={goSettings}
                      title="הגדרות קבוצה"
                      onMouseDown={(e) => e.preventDefault()}
                    >⚙️</button>
                  )}
                </div>
              </header>

              {g.description && <p className="card-desc">{g.description}</p>}

              <div className="meta-grid">
                <div><small>נוצר:</small><b>{formatDate(g.creationDate)}</b></div>
                <div><small>סיום:</small><b>{formatDate(g.endDate)}</b></div>
              </div>

              {/* מצב נעולה ולא חבר/ה */}
              {!isOwner && isLocked && (
                <div className="actions" style={{ marginTop: 10 }}>
                  {isMember ? (
                    <span className="chip success">מחובר/ת</span>
                  ) : isRejected ? (
                    <>
                      <div className="removed-box" style={{ background: '#fff3f3' }}>
                        בקשתך נדחתה ע״י מנהל/ת הקבוצה. ניתן לשלוח בקשה חדשה.
                      </div>
                      <button className="btn" onClick={onRequestJoin}>שלח/י בקשה שוב</button>
                    </>
                  ) : isPending ? (
                    <>
                      <button className="btn" disabled>בהמתנה…</button>
                      <div className="pending-hint">הבקשה נשלחה וממתינה לאישור מנהל/ת</div>
                    </>
                  ) : wasRemoved ? (
                    <>
                      <div className="removed-box">
                        הוסרת מהקבוצה ע״י מנהל/ת. ניתן לשלוח בקשת הצטרפות חדשה.
                      </div>
                      <button className="btn" onClick={onRequestJoin}>שלח/י בקשת הצטרפות</button>
                    </>
                  ) : (
                    <button className="btn" onClick={onRequestJoin}>בקש/י הצטרפות</button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
