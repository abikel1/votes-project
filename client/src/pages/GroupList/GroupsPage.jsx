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
  clearRemovedNotice, // ננקה את הודעת "הוסרת" כששולחים בקשה מחדש
} from '../../slices/joinRequestsSlice';
import http from '../../api/http';
import './GroupsPage.css';

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

  const joinedIdsSet = useSelector(selectMyJoinedIds);
  const pendingIdsSet = useSelector(selectMyPendingSet);
  const createdIdsSet = useSelector(selectMyCreatedIds);

  // ← חדש: ניקח את כל מפת "הוסרת" בקריאה אחת (בלי הוקים בתוך map)
  const removedMap = useSelector((s) => s.joinReq.removedNotice || {});

  // 1) לשחזר pending מ-LS לפני ששרת עונה
  useEffect(() => { dispatch(hydratePendingFromLocalStorage()); }, [dispatch]);

  // 2) טעינה ראשונית
  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchMyGroups());
    dispatch(fetchMyJoinStatuses());
  }, [dispatch]);

  // 3) פולינג עדין לעדכון מהיר לאחר אישור מנהל
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

  // 5) אם מזהים חברות — מסמנים מקומית (ניקוי pending מה-LS)
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

  return (
    <div className="page-wrap">
      <h2 className="page-title">כל הקבוצות</h2>
      <div className="groups-grid">
        {groups.map((g) => {
          const gid = String(g._id);
          const isLocked = !!g.isLocked;

          // בעלות (ללא hooks)
          const createdByEmail = lc(g.createdBy ?? g.created_by ?? g.createdByEmail ?? g.ownerEmail ?? g.owner);
          const createdById = String(g.createdById ?? '');
          const isOwner =
            !!g.isOwner ||
            (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
            (!!myId && !!createdById && myId === createdById);

          const isMember = joinedIdsSet.has(gid);
          const isPending = pendingIdsSet.has(gid);
          const wasRemoved = !!removedMap[gid]; // ← במקום useSelector בתוך map

          const goSettings = (e) => { e.stopPropagation(); navigate(`/groups/${gid}/settings`); };

          const onRequestJoin = (e) => {
            e.stopPropagation();
            if (isMember || isPending) return;
            dispatch(clearRemovedNotice(gid)); // לא להראות שוב את ההודעה אחרי בקשה חדשה
            dispatch(requestJoinGroup(gid)).unwrap().catch(() => {});
          };

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
              // אם אינה/אינך חבר/ה — לא נפתח את הקבוצה
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
