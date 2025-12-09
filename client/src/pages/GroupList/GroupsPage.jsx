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
import { HiOutlineDocumentText } from "react-icons/hi";
import { TourProvider, useTour } from '@reactour/tour';

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
import { useTranslation } from 'react-i18next';
import GlobalTour from '../../Tour/GlobalTour';

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
      const { setIsOpen } = useTour();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { loading, error: err, list: groups } = useSelector((s) => s.groups);
  const { userEmail: authEmail, userId: authId, isAdmin } = useSelector((s) => s.auth);
  // const { userEmail: authEmail, userId: authId } = useSelector((s) => s.auth);
  useEffect(() => {
    console.log('Auth in GroupsPage:', {
      authEmail,
      authId,
      isAdmin,
    });
  }, [authEmail, authId, isAdmin]);

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
const [steps, setSteps] = useState([]);

  const onCreateGroupClick = () => {
    if (!isAuthed) {
      toast.error(t('groups.list.toasts.loginToCreate'));
      return;
    }
    navigate('/groups/create');
  };


  // const steps = [
  //   {
  //     selector: '#groups-header',
  //     content: 'כאן נמצאים הכלים של עמוד הקבוצות',
  //   },
  //   {
  //     selector: '#groups-search',
  //     content: 'כאן מחפשים קבוצות לפי שם',
  //   },
  //   {
  //     selector: '#groups-filter',
  //     content: 'כאן מסננים קבוצות לפי קטגוריות',
  //   },
  //   {
  //     selector: '#groups-list',
  //     content: 'כאן נמצאות כל הקבוצות המוצגות',
  //   },
  //    {
  //   selector: `#groups-card-title-${gid}`,
  //   content: 'כאן מוצג שם הקבוצה',
  // },
  // {
  //   selector: `#groups-card-badges-${gid}`,
  //   content: 'סמלים המציינים סטטוס כמו נעול או הגשת מועמדות פתוחה',
  // },
  // {
  //   selector: `#groups-card-desc-${gid}`,
  //   content: 'כאן מופיע תיאור קצר של הקבוצה',
  // },
  // {
  //   selector: `#groups-card-owner-${gid}`,
  //   content: 'כאן מופיע מי מנהל/ת את הקבוצה',
  // },
  // {
  //   selector: `#groups-card-footer-${gid}`,
  //   content: 'כאן מוצג תאריך סיום הקבוצה או שהיא פגה',
  // },
  // {
  //   selector: `#groups-card-actions-${gid}`,
  //   content: 'כאן נמצאים כפתורי הפעולה: בקשת הצטרפות, pending, rejected, או הגדרות',
  // },
  // ];
  const filteredGroups = groups
    .filter((g) => {
      const gid = String(g._id);
      const nameMatch = g.name?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!nameMatch) return false;

      const isLocked = !!g.isLocked;
      const isOwner = createdIdsSet.has(gid);
      const isMember = joinedIdsSet.has(gid);
      const now = new Date();
      const candidateOpen = g.candidateEndDate && new Date(g.candidateEndDate) > now;

      // הצבעה פתוחה: תאריך סיום הקבוצה בעתיד
      // וגם או שאין תאריך הגשת מועמדות, או שהוא כבר עבר
      const votingOpen =
        g.endDate &&
        new Date(g.endDate) > now &&
        (!g.candidateEndDate || new Date(g.candidateEndDate) <= now);

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
          return new Date(g.endDate) < now;
        case 'candidateOpen':
          return candidateOpen;
        case 'votingOpen':
          return votingOpen;
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

// 🌟 העבר את pageGroups לכאן לפני ה-useEffect

useEffect(() => {
  if (pageGroups.length > 0) {
    const firstGroupId = String(pageGroups[0]._id);

    setSteps([
      {
        selector: '#groups-header',
        content: 'כאן נמצאים הכלים של עמוד הקבוצות',
      },
      {
        selector: `#groups-card-title-${firstGroupId}`,
        content: 'כאן מוצג שם הקבוצה',
      },
      {
        selector: `#groups-card-badges-${firstGroupId}`,
        content: 'סמלים המציינים סטטוס כמו נעול או הגשת מועמדות פתוחה',
      },
      {
        selector: `#groups-card-desc-${firstGroupId}`,
        content: 'כאן מופיע תיאור קצר של הקבוצה',
      },
      {
        selector: `#groups-card-owner-${firstGroupId}`,
        content: 'כאן מופיע מי מנהל/ת את הקבוצה',
      },
      {
        selector: `#groups-card-footer-${firstGroupId}`,
        content: 'כאן מוצג תאריך סיום הקבוצה או שהיא פגה',
      },
      {
        selector: `#groups-card-actions-${firstGroupId}`,
        content: 'כאן נמצאים כפתורי הפעולה',
      },
    ]);

    setIsOpen(true);
  }
}, []);



  useEffect(() => { dispatch(hydratePendingFromLocalStorage()); }, [dispatch]);

  useEffect(() => {
    dispatch(fetchGroups());
    if (isAuthed) {
      dispatch(fetchMyGroups());
      dispatch(fetchMyJoinStatuses());
    }
  }, [dispatch, isAuthed]);

  useEffect(() => {
    if (!isAuthed) return;
    const tmr = setInterval(() => {
      dispatch(fetchMyGroups());
      dispatch(fetchMyJoinStatuses());
    }, 5000);
    return () => clearInterval(tmr);
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

  if (loading) return <div className="groups-loading">{t('groups.list.loading')}</div>;
  if (err) return <div className="groups-error">{err}</div>;

  if (!groups?.length)
    return (
      <div className="groups-empty">
        <p>{t('groups.list.empty.noGroups')}</p>
        {isAuthed ? (
          <button
            className="groups-create-btn"
            onClick={onCreateGroupClick}
          >
            {t('groups.list.empty.createButton')}
          </button>
        ) : (
          <p className="groups-empty-hint">
            {t('groups.list.empty.loginHint')}
          </p>
        )}
      </div>
    );

  const myEmail = lc(authEmail) || lc(localStorage.getItem('userEmail'));
  const myId = String(authId ?? localStorage.getItem('userId') ?? '');


  return (
<TourProvider steps={steps}>

    <GlobalTour page="groups" steps={steps} />

    <div className="groups-page">
      {/* סרגל עליון */}
      
     <>
      <button onClick={() => setIsOpen(true)}>
        הפעל הדרכה
      </button>

      {/* כל ה-HTML / JSX של הדף */}
    </>
      <div id="groups-header" className="groups-toolbar">
        <div className="groups-toolbar-right">
          <input
            id="groups-search"

            type="text"
            placeholder={t('groups.list.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="groups-search"
          />

          <div className="groups-controls">
            <button
              id="groups-filter"

              className="groups-control-btn"
              onClick={() => {
                setShowFilters((v) => !v);
                setShowSort(false);
              }}
              title={t('groups.list.filters.title')}
            >
              <img src="/icons/filter.png" alt={t('groups.list.filters.alt')} />
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
                  {t('groups.list.filters.all')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="open"
                    checked={filter === 'open'}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  {t('groups.list.filters.open')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="locked"
                    checked={filter === 'locked'}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  {t('groups.list.filters.locked')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="joined"
                    checked={filter === 'joined'}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  {t('groups.list.filters.joined')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="owned"
                    checked={filter === 'owned'}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  {t('groups.list.filters.owned')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="expired"
                    checked={filter === 'expired'}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  {t('groups.list.filters.expired')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="candidateOpen"
                    checked={filter === 'candidateOpen'}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  {t('groups.list.filters.candidateOpen')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="votingOpen"
                    checked={filter === 'votingOpen'}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  {t('groups.list.filters.votingOpen')}
                </label>
              </div>
            )}

            <button
              className="groups-control-btn"
              onClick={() => {
                setShowSort((v) => !v);
                setShowFilters(false);
              }}
              title={t('groups.list.sort.title')}
            >
              <img src="/icons/sort.png" alt={t('groups.list.sort.alt')} />
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
                  {t('groups.list.sort.creationDate')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="endDate"
                    checked={sortBy === 'endDate'}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  {t('groups.list.sort.endDate')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="name"
                    checked={sortBy === 'name'}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  {t('groups.list.sort.name')}
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* רשת קבוצות */}
      <div id="groups-list" className="groups-grid">
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
            (g.createdById && g.createdById.email)
          );

          const createdById =
            g.createdById && typeof g.createdById === 'object'
              ? String(g.createdById._id)
              : String(g.createdById ?? '');

          const isOwner =
            isAdmin ||
            !!g.isOwner ||
            (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
            (!!myId && !!createdById && myId === createdById);

          const isMember = joinedIdsSet.has(gid);
          const isPending = pendingIdsSet.has(gid);
          const isRejected = rejectedIdsSet.has(gid);
          const wasRemoved = !!removedMap[gid];

          const endDate = new Date(g.endDate);
          const isExpired = endDate < new Date();

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

          const onRequestJoin = (e) => {
            e.stopPropagation();
            if (isMember || isPending) return;
            if (!isAuthed) {
              toast.error(t('groups.list.toasts.loginToRequestJoin'));
              return;
            }
            dispatch(clearRemovedNotice(gid));
            dispatch(requestJoinGroup(gid)).unwrap().catch(() => { });
          };

          const onCardClick = async () => {
            // 👑 אדמין – תמיד נכנס, גם לקבוצות נעולות
            if (isAdmin) {
              navigate(`/groups/${slug}`, {
                state: { groupId: gid },
              });
              return;
            }

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
                toast.error(t('groups.list.toasts.lockedLoginToJoin'));
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
              } catch { }
              toast.info(t('groups.list.toasts.pendingStill'));
              return;
            }

            // קבוצה נעולה + לא חברה
            if (!isOwner && isLocked && !isMember) {
              if (!isAuthed) {
                toast.error(t('groups.list.toasts.lockedLoginToJoin'));
                return;
              }
              if (isRejected) {
                toast.error(t('groups.list.toasts.rejected'));
                return;
              }
              return;
            }

            // בעל/ת הקבוצה / חבר/ה בקבוצה נעולה
            navigate(`/groups/${slug}`, {
              state: { groupId: gid },
            });
          };

          const cardDisabled =
            !isAdmin &&            // 👈 רק מי שלא אדמין יכול להיות "מנוטרל"
            !isOwner &&
            isLocked &&
            ((isPending && !isMember) || (!isPending && !isMember));

          return (
          <div
  key={gid}
  id={`groups-card-${gid}`}          // 🌟 ID ייחודי לכל כרטיס
  onClick={onCardClick}
  className={`groups-card 
    ${cardDisabled ? 'groups-card-disabled' : ''} 
    ${isExpired ? 'groups-card-expired' : ''}`}
>
  <div className="groups-card-header" id={`groups-card-header-${gid}`}>
    <h3 className="groups-card-title" id={`groups-card-title-${gid}`}>
      {g.name}
    </h3>
    <div className="groups-card-badges" id={`groups-card-badges-${gid}`}>
      {isLocked && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src="/icons/padlock.png"
            alt={t('groups.list.card.lockedAlt')}
            className="groups-badge-locked"
            title={t('groups.list.card.lockedTitle')}
            id={`groups-badge-locked-${gid}`}
          />
          <span
            className={`groups-lock-status ${isMember || isOwner ? 'member' : 'not-member'}`}
            title={
              isMember || isOwner
                ? t('groups.list.card.memberTooltip')
                : t('groups.list.card.notMemberTooltip')
            }
            id={`groups-lock-status-${gid}`}
          />
        </div>
      )}
      {isOwner && (
        <button
          className="groups-settings-btn"
          onClick={goSettings}
          title={t('groups.list.card.settingsTitle')}
          id={`groups-settings-btn-${gid}`}
        >
          <img src="/icons/settings.png" alt={t('groups.list.card.settingsAlt')} />
        </button>
      )}
      {g.candidateEndDate && new Date() < new Date(g.candidateEndDate) && (
        <HiOutlineDocumentText
          size={20}
          className="groups-badge-candidate"
          title="הגשת מועמדות פתוחה"
          id={`groups-badge-candidate-${gid}`}
        />
      )}
    </div>
  </div>

  {g.description && (
    <p className="groups-card-desc" id={`groups-card-desc-${gid}`}>
      {g.description}
    </p>
  )}

  <div className="groups-card-owner" id={`groups-card-owner-${gid}`}>
    <span className="groups-card-owner-label">{t('groups.list.card.ownerLabel')}</span>
    <span className="groups-card-owner-value">
      {ownerName || t('groups.list.card.ownerUnknown')}
    </span>
  </div>

  <div className="groups-card-footer" id={`groups-card-footer-${gid}`}>
    {isExpired ? (
      <div className="groups-card-date-expired-text">
        {t('groups.list.card.expiredText')}
      </div>
    ) : (
      <div className="groups-card-date">
        <span className="groups-card-date-label">
          {t('groups.list.card.endDateLabel')}
        </span>
        <span className="groups-card-date-value">{formatDate(g.endDate)}</span>
      </div>
    )}
  </div>

  {(!isOwner && isLocked) && (
    <div className="groups-card-actions" id={`groups-card-actions-${gid}`}>
    {isMember ? (
                    <span className="groups-status groups-status-member">
                      {t('groups.list.card.status.member')}
                    </span>
                  ) : !isAuthed ? null : isRejected ? (
                    <>
                      <div className="groups-notice groups-notice-rejected">
                        {t('groups.list.card.rejectedNotice')}
                      </div>
                      <button className="groups-action-btn" onClick={onRequestJoin}>
                        {t('groups.list.card.requestAgain')}
                      </button>
                    </>
                  ) : isPending ? (
                    <>
                      <button
                        className="groups-action-btn groups-action-btn-pending"
                        disabled
                      >
                        {t('groups.list.card.pendingButton')}
                      </button>
                      <p className="groups-hint">
                        {t('groups.list.card.pendingHint')}
                      </p>
                    </>
                  ) : wasRemoved && !isMember && !isPending ? (
                    <>
                      <div className="groups-notice groups-notice-removed">
                        {t('groups.list.card.removedNotice')}
                      </div>
                      <button className="groups-action-btn" onClick={onRequestJoin}>
                        {t('groups.list.card.requestJoin')}
                      </button>
                    </>
                  ) : (
                    <button className="groups-action-btn" onClick={onRequestJoin}>
                      {t('groups.list.card.requestJoin')}
                    </button>
                  )}    </div>
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
            {t('groups.list.pagination.prev')}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`groups-page-btn ${page === safePage ? 'active' : ''}`}
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
            {t('groups.list.pagination.next')}
          </button>
        </div>
      )}

      <button
        className="groups-fab"
        onClick={onCreateGroupClick}
        title={t('groups.list.fab.title')}
      >
        +
      </button>
    </div>
        </TourProvider>


  );
}
