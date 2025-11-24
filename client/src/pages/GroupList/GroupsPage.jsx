// src/pages/GroupList/GroupsPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchGroups,
  fetchMyGroups,
  selectMyJoinedIds,
  selectMyCreatedIds,
} from '../../slices/groupsSlice';
import { toast } from 'react-hot-toast';

import {
  requestJoinGroup,
  markJoinedLocally,
  fetchMyJoinStatuses,
  selectMyPendingSet,
  hydratePendingFromLocalStorage,
  clearRemovedNotice,
  selectMyRejectedSet,
} from '../../slices/joinRequestsSlice';
import http from '../../api/http';
import './GroupsPage.css';

function formatDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return d;
  }
}

const lc = (s) => (s || '').trim().toLowerCase();

const makeSlug = (name = '') =>
  encodeURIComponent(
    String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-'),
  );

export default function GroupsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error: err, list: groups } = useSelector((s) => s.groups);
  const { userEmail: authEmail, userId: authId } = useSelector((s) => s.auth);

  const joinedIdsSet = useSelector(selectMyJoinedIds);
  const pendingIdsSet = useSelector(selectMyPendingSet);
  const rejectedIdsSet = useSelector(selectMyRejectedSet);
  const createdIdsSet = useSelector(selectMyCreatedIds);

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('creationDate');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 16;

  const removedMap = useSelector((s) => s.joinReq.removedNotice || {});

  const isAuthed = !!authId || !!authEmail;

  // const onCreateGroupClick = () => {
  //   if (!isAuthed) {
  //     toast.error('כדי ליצור קבוצה יש להתחבר תחילה.');
  //     return;
  //   }
  //   navigate('/groups/create');
  // };

  // <<<<<<< HEAD
  //   useEffect(() => {
  //     dispatch(hydratePendingFromLocalStorage());
  //   }, [dispatch]);
  // =======

  const onCreateGroupClick = () => {
    if (!isAuthed) {
      toast.error('כדי ליצור קבוצה יש להתחבר תחילה.');

      return;
    }
    navigate('/groups/create');
  };

  useEffect(() => { dispatch(hydratePendingFromLocalStorage()); }, [dispatch]);

  // >>>>>>> fd09d35ac375e1d72d983305dcc67a256b38f216

  useEffect(() => {
    dispatch(fetchGroups());
    if (isAuthed) {
      dispatch(fetchMyGroups());
      dispatch(fetchMyJoinStatuses());
    }
  }, [dispatch, isAuthed]);

  useEffect(() => {
    if (!isAuthed) return;
    const t = setInterval(() => {
      dispatch(fetchMyGroups());
      dispatch(fetchMyJoinStatuses());
    }, 5000);
    return () => clearInterval(t);
  }, [dispatch, isAuthed]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        e.target.closest('.groups-control-btn') ||
        e.target.closest('.groups-dropdown')
      )
        return;

      if (showFilters) setShowFilters(false);
      if (showSort) setShowSort(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showFilters, showSort]);

  useEffect(() => {
    if (!isAuthed) return;

    const refresh = () => {
      const authedNow = !!authId || !!authEmail;
      if (!authedNow) return;
      dispatch(fetchMyGroups());
      dispatch(fetchMyJoinStatuses());
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [dispatch, isAuthed, authId, authEmail]);

  useEffect(() => {
    for (const gid of joinedIdsSet) {
      dispatch(markJoinedLocally(String(gid)));
    }
  }, [dispatch, joinedIdsSet]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, sortBy, groups?.length]);

  if (loading) return <div className="groups-loading">טוען קבוצות...</div>;
  if (err) return <div className="groups-error">{err}</div>;

  if (!groups?.length)
    return (
      <div className="groups-empty">
        <p>אין קבוצות עדיין.</p>
        {isAuthed ? (
          <button
            className="groups-create-btn"
            onClick={onCreateGroupClick}
          >
            + יצירת קבוצה חדשה
          </button>
        ) : (
          <p className="groups-empty-hint">
            כדי ליצור קבוצה יש להתחבר תחילה.
          </p>
        )}
      </div>
    );

  const myEmail = lc(authEmail) || lc(localStorage.getItem('userEmail'));
  const myId = String(authId ?? localStorage.getItem('userId') ?? '');

  const filteredGroups = groups
    .filter((g) => {
      const gid = String(g._id);
      const nameMatch = g.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
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
        case 'expired':
          return new Date(g.endDate) < new Date();
        default:
          return true;
      }
    })
    .sort((a, b) => {
      if (sortBy === 'creationDate')
        return new Date(b.creationDate) - new Date(a.creationDate);
      if (sortBy === 'endDate')
        return new Date(a.endDate) - new Date(b.endDate);
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'he');
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageGroups = filteredGroups.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="groups-page">
      {/* סרגל עליון */}
      <div className="groups-toolbar">
        <div className="groups-toolbar-right">
          <input
            type="text"
            placeholder="חיפוש קבוצות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="groups-search"
          />

          <div className="groups-controls">
            <button
              className="groups-control-btn"
              onClick={() => {
                setShowFilters((v) => !v);
                setShowSort(false);
              }}
              title="סינון"
            >
              <img src="/src/assets/icons/filter.png" alt="סינון" />
            </button>
            {showFilters && (
              <div className="groups-dropdown">
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
                  {/* <<<<<<< HEAD
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
======= */}
                  <input type="radio" name="filter" value="open" checked={filter === 'open'} onChange={(e) => setFilter(e.target.value)} />
                  קבוצות פתוחות
                </label>
                <label>
                  <input type="radio" name="filter" value="locked" checked={filter === 'locked'} onChange={(e) => setFilter(e.target.value)} />
                  קבוצות נעולות
                </label>
                <label>
                  <input type="radio" name="filter" value="joined" checked={filter === 'joined'} onChange={(e) => setFilter(e.target.value)} />
                  קבוצות שאני מחובר/ת
                </label>
                <label>
                  <input type="radio" name="filter" value="owned" checked={filter === 'owned'} onChange={(e) => setFilter(e.target.value)} />
                  קבוצות שאני מנהל/ת
                  {/* >>>>>>> fd09d35ac375e1d72d983305dcc67a256b38f216 */}
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="expired"
                    checked={filter === 'expired'}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  קבוצות שהסתיימו
                </label>
              </div>
            )}

            <button
              className="groups-control-btn"
              onClick={() => {
                setShowSort((v) => !v);
                setShowFilters(false);
              }}
              title="מיון"
            >
              <img src="/src/assets/icons/sort.png" alt="מיון" />
            </button>
            {showSort && (
              <div className="groups-dropdown">
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="creationDate"
                    checked={sortBy === 'creationDate'}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  תאריך יצירה (חדש קודם)
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="endDate"
                    checked={sortBy === 'endDate'}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  תאריך סיום (מוקדם קודם)
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="name"
                    checked={sortBy === 'name'}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  שם קבוצה (א-ת)
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* רשת קבוצות */}
      <div className="groups-grid">
        {pageGroups.map((g) => {
          const gid = String(g._id);
          const slug = makeSlug(g.name || gid);
          const isLocked = !!g.isLocked;

          const createdByEmail = lc(
            g.createdBy ??
            g.created_by ??
            g.createdByEmail ??
            g.ownerEmail ??
            g.owner ??
            (g.createdById && g.createdById.email) // אם הגיע מהשרת
          );

          // לתמוך גם במצב שהשרת מחזיר ObjectId וגם במצב של אובייקט מאוכלס
          const createdById =
            g.createdById && typeof g.createdById === 'object'
              ? String(g.createdById._id)
              : String(g.createdById ?? '');

          const isOwner =
            !!g.isOwner ||
            (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
            (!!myId && !!createdById && myId === createdById);

          const isMember = joinedIdsSet.has(gid);
          const isPending = pendingIdsSet.has(gid);
          const isRejected = rejectedIdsSet.has(gid);
          const wasRemoved = !!removedMap[gid];

          const endDate = new Date(g.endDate);
          const isExpired = endDate < new Date();
          // שם המנהל/ת – מורכב משם פרטי ושם משפחה אם קיימים
          const ownerName =
            g.createdById && typeof g.createdById === 'object'
              ? `${g.createdById.firstName || ''} ${g.createdById.lastName || ''}`.trim()
              : '';


          const goSettings = (e) => {
            e.stopPropagation();
            navigate(`/groups/${slug}/settings`, {
              state: { groupId: gid },
            });
          };

          // <<<<<<< HEAD
          //           const isNewUser =
          //             !joinedIdsSet.size && !pendingIdsSet.size && !rejectedIdsSet.size;

          //           const onRequestJoin = (e) => {
          //             e.stopPropagation();
          //             if (isMember || isPending) return;
          //             if (!isAuthed) {
          //               toast.error('כדי לשלוח בקשת הצטרפות יש להתחבר תחילה.');
          //               return;
          //             }
          //             dispatch(clearRemovedNotice(gid));
          //             dispatch(requestJoinGroup(gid)).unwrap().catch(() => {});
          // =======
          const onRequestJoin = (e) => {
            e.stopPropagation();
            if (isMember || isPending) return;
            if (!isAuthed) {
              toast.error('כדי לשלוח בקשת הצטרפות יש להתחבר תחילה.');


              return;
            }
            dispatch(clearRemovedNotice(gid));
            dispatch(requestJoinGroup(gid)).unwrap().catch(() => { });
            // >>>>>>> fd09d35ac375e1d72d983305dcc67a256b38f216
          };

          const onCardClick = async () => {
            // קבוצה פתוחה – תמיד נכנסים
            if (!isLocked) {
              navigate(`/groups/${slug}`, {
                state: { groupId: gid },
              });
              return;
            }

            // קבוצה נעולה + pending + לא חברה
            if (!isOwner && isLocked && isPending && !isMember) {
              if (!isAuthed) {
                toast.error('הקבוצה נעולה. כדי לבקש הצטרפות – יש להתחבר');
                return;
              }
              try {
                const { data } = await http.get(
                  `/groups/${gid}/my-membership`,
                );
                if (data?.member) {
                  dispatch(markJoinedLocally(gid));
                  navigate(`/groups/${slug}`, {
                    state: { groupId: gid },
                  });
                  return;
                }
                // <<<<<<< HEAD
              } catch { }
              toast.info('עדיין אינך מחובר/ת לקבוצה. הבקשה בהמתנה לאישור מנהל/ת.');
              // =======
              // } catch { }
              // toast.info('עדיין אינך מחובר/ת לקבוצה. הבקשה בהמתנה לאישור מנהל/ת.');
              // >>>>>>> fd09d35ac375e1d72d983305dcc67a256b38f216
              return;
            }

            // קבוצה נעולה + לא חברה
            if (!isOwner && isLocked && !isMember) {
              if (!isAuthed) {
                toast.error('הקבוצה נעולה. כדי לבקש הצטרפות – יש להתחבר');
                return;
              }
              if (isRejected) {
                // <<<<<<< HEAD
                //                 toast.error(
                //                   'בקשתך נדחתה על ידי מנהלת הקבוצה. ניתן לשלוח בקשה חדשה.',
                //                 );
                // =======
                toast.error('בקשתך נדחתה על ידי מנהל/ת הקבוצה. ניתן לשלוח בקשה חדשה.');

                // >>>>>>> fd09d35ac375e1d72d983305dcc67a256b38f216
                return;
              }
              return;
            }

            // בעלת הקבוצה / חברה בקבוצה נעולה
            navigate(`/groups/${slug}`, {
              state: { groupId: gid },
            });
          };

          const cardDisabled =
            !isOwner &&
            isLocked &&
            ((isPending && !isMember) || (!isPending && !isMember));

          return (
            <div
              key={gid}
              onClick={onCardClick}
              className={`groups-card 
    ${cardDisabled ? 'groups-card-disabled' : ''} 
    ${isExpired ? 'groups-card-expired' : ''}`}
            >
              <div className="groups-card-header">
                <h3 className="groups-card-title">{g.name}</h3>
                <div className="groups-card-badges">
                  {isLocked && (
                    <div
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      <img
                        src="/src/assets/icons/padlock.png"
                        alt="נעול"
                        className="groups-badge-locked"
                        title="קבוצה נעולה"
                      />
                      <span
                        // <<<<<<< HEAD
                        //                         className={`groups-lock-status ${
                        //                           isMember || isOwner ? 'member' : 'not-member'
                        //                         }`}
                        //                         title={isMember || isOwner ? 'מחוברת' : 'לא מחוברת'}
                        // =======
                        className={`groups-lock-status ${isMember || isOwner ? 'member' : 'not-member'}`}
                        title={isMember || isOwner ? 'מחובר/ת' : 'לא מחובר/ת'}
                      />
                    </div>
                  )}

                  {isOwner && (
                    <button
                      className="groups-settings-btn"
                      onClick={goSettings}
                      title="הגדרות קבוצה"
                    >
                      <img src="/src/assets/icons/settings.png" alt="הגדרות" />
                    </button>
                  )}
                </div>
              </div>

              {g.description && (
                <p className="groups-card-desc">{g.description}</p>
              )}

              <div className="groups-card-owner">
                <span className="groups-card-owner-label">מנהל/ת:</span>
                <span className="groups-card-owner-value">
                  {ownerName || 'לא ידוע'}
                </span>
              </div>


              <div className="groups-card-footer">
                {isExpired ? (
                  <div className="groups-card-date-expired-text">
                    תקופת ההצבעה הסתיימה — לצפייה בתוצאות
                  </div>
                ) : (
                  <div className="groups-card-date">
                    <span className="groups-card-date-label">תאריך סיום:</span>
                    <span className="groups-card-date-value">
                      {formatDate(g.endDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* מצב נעולה ולא חברה */}
              {!isOwner && isLocked && (
                <div className="groups-card-actions">
                  {isMember ? (
                    // <<<<<<< HEAD
                    //                     <span className="groups-status groups-status-member">
                    //                       מחוברת
                    //                     </span>
                    //                   ) : !isAuthed ? null : isRejected ? (
                    //                     <>
                    //                       <div className="groups-notice groups-notice-rejected">
                    //                         בקשתך נדחתה על ידי מנהלת הקבוצה. ניתן לשלוח בקשה
                    //                         חדשה.
                    //                       </div>
                    //                       <button
                    //                         className="groups-action-btn"
                    //                         onClick={onRequestJoin}
                    //                       >
                    //                         שלחי בקשה שוב
                    // =======
                    <span className="groups-status groups-status-member">מחובר/ת</span>
                  ) : !isAuthed ? null : isRejected ? (
                    <>
                      <div className="groups-notice groups-notice-rejected">
                        בקשתך נדחתה על ידי מנהל/ת הקבוצה. ניתן לשלוח בקשה חדשה.
                      </div>
                      <button className="groups-action-btn" onClick={onRequestJoin}>
                        שלח/י בקשה שוב
                        {/* >>>>>>> fd09d35ac375e1d72d983305dcc67a256b38f216 */}
                      </button>
                    </>
                  ) : isPending ? (
                    <>
                      <button
                        className="groups-action-btn groups-action-btn-pending"
                        disabled
                      >
                        בהמתנה...
                      </button>
                      {/* <<<<<<< HEAD
                      <p className="groups-hint">
                        הבקשה נשלחה וממתינה לאישור מנהלת
                      </p>
======= */}
                      <p className="groups-hint">בקשתך נשלחה וממתינה לאישור מנהל/ת</p>
                      {/* >>>>>>> fd09d35ac375e1d72d983305dcc67a256b38f216 */}
                    </>
                  ) : wasRemoved && !isMember && !isPending ? (
                    <>
                      <div className="groups-notice groups-notice-removed">
                        {/* <<<<<<< HEAD
                        הוסרת מהקבוצה על ידי מנהלת. ניתן לשלוח בקשת הצטרפות
                        חדשה.
                      </div>
                      <button
                        className="groups-action-btn"
                        onClick={onRequestJoin}
                      >
                        שלחי בקשת הצטרפות
                      </button>
                    </>
                  ) : (
                    <button
                      className="groups-action-btn"
                      onClick={onRequestJoin}
                    >
                      בקשי הצטרפות
                    </button>
======= */}
                        הוסרת מהקבוצה על ידי מנהל/ת. ניתן לשלוח בקשת הצטרפות חדשה.
                      </div>
                      <button className="groups-action-btn" onClick={onRequestJoin}>
                        בקשת הצטרפות                      </button>
                    </>
                  ) : (
                    <button className="groups-action-btn" onClick={onRequestJoin}>
                      בקשת הצטרפות                    </button>
                    // >>>>>>> fd09d35ac375e1d72d983305dcc67a256b38f216
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* פג'ינציה */}
      {filteredGroups.length > PAGE_SIZE && (
        <div className="groups-pagination">
          <button
            className="groups-page-btn"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            הקודם
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`groups-page-btn ${page === safePage ? 'active' : ''
                }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="groups-page-btn"
            disabled={safePage === totalPages}
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
          >
            הבא
          </button>
        </div>
      )}

      <button
        className="groups-fab"
        onClick={onCreateGroupClick}
        title="יצירת קבוצה חדשה"
      >
        +
      </button>
    </div>
  );
}
