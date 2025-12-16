// src/pages/GroupDetail/GroupDetailPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiClock, HiUserGroup, HiUser, HiOutlineBadgeCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { FiSettings, FiMessageSquare, FiX } from 'react-icons/fi';
import { BiArrowBack } from 'react-icons/bi';
import { FiZap } from 'react-icons/fi';
import { TourProvider } from '@reactour/tour';

import CountdownTimer from '../../components/CountdownTimer/CountdownTimer';
import GroupChat from '../../components/GroupChat/GroupChat';
import { useGroupDetailTour } from '../../Tour/useGroupDetailTour';
import { fetchCampaign } from '../../slices/campaignSlice';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';

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
import CandidateApplyForm from '../../components/CandidateApplyForm';
import { useTranslation } from 'react-i18next';

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

const makeCandidateSlug = (name = '') =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

const makeSlug = (name = '') =>
  encodeURIComponent(
    String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-'),
  );

function GroupDetailPageContent() {
  const { groupSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navGroupId = location.state?.groupId || null;
  const [groupId, setGroupId] = useState(navGroupId);
const [descExpanded, setDescExpanded] = useState(false);

  const {
    selectedGroup: group,
    loading: groupLoading,
    error: groupError,
  } = useSelector((s) => s.groups);

  const candidates = useSelector(selectCandidatesForGroup(groupId || '')) || [];
  const loadingCandidates = useSelector(selectCandidatesLoadingForGroup(groupId || ''));
  const errorCandidates = useSelector(selectCandidatesErrorForGroup(groupId || ''));
const toggleDesc = () => setDescExpanded(prev => !prev);

  const joinedIdsSet = useSelector(selectMyJoinedIds);

  const { userEmail: authEmail, userId: authId, isAdmin } = useSelector((s) => s.auth);
  const isAuthed =
    !!authId ||
    !!authEmail ||
    !!localStorage.getItem('authToken');

  const [leftWidth, setLeftWidth] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const [isChatOpen, setIsChatOpen] = useState(false);


  // טאב פעיל במובייל: 'candidates' או 'info'
  const [activeTab, setActiveTab] = useState('candidates');

  // זיהוי גודל מסך
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ===== קריאת מזהי משתמש/מייל והרשאות בסיס =====
  const gidStr = group?._id ? String(group._id) : '';
  const slug = makeSlug(group?.name || groupSlug || gidStr || '');
  const isLocked = !!group?.isLocked;

  const myEmail = (authEmail || localStorage.getItem('userEmail') || '')
    .trim()
    .toLowerCase();
  const myId = String(authId ?? localStorage.getItem('userId') ?? '');

  const createdByEmail = (
    group?.createdBy ??
    group?.created_by ??
    group?.createdByEmail ??
    group?.ownerEmail ??
    group?.owner ??
    ''
  )
    .trim()
    .toLowerCase();
  const createdById = String(group?.createdById ?? '');

  const isOwner =
    isAdmin ||
    !!group?.isOwner ||
    (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
    (!!myId && !!createdById && myId === createdById);

  const isMember =
    !!joinedIdsSet &&
    typeof joinedIdsSet.has === 'function' &&
    !!gidStr &&
    joinedIdsSet.has(gidStr);

  const canChat = !isLocked || isOwner || isMember;
  const [candidatesWithCampaign, setCandidatesWithCampaign] = useState([]);

  // מדריך המשתמש
  const { tourInitialized, openTour } = useGroupDetailTour({
    group,
    candidates,
    isOwner,
    isAuthed,
    isMobile
  });

  // ===== פתרון groupId לפי slug (אם נכנסו ישירות לכתובת) =====
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

  // ===== טעינת נתוני קבוצה, מועמדים =====
  // ===== טעינת נתוני קבוצה, מועמדים =====

  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    if (!candidatesWithCampaign || candidatesWithCampaign.length === 0) return;

    const bar = candidatesWithCampaign.map(c => ({
      name: c.name ? (c.name.length > 12 ? c.name.slice(0, 12) + '...' : c.name) : 'לא ידוע',
      likeCount: Number(c.campaign?.likeCount || 0),
    }));

    const pie = candidatesWithCampaign
      .filter(c => Number(c.campaign?.likeCount || 0) > 0)
      .map(c => ({
        name: c.name,
        value: Number(c.campaign.likeCount),
      }));

    console.log('Updated Bar Data:', bar);
    console.log('Updated Pie Data:', pie);

    setBarData(bar);
    setPieData(pie);
  }, [candidatesWithCampaign]);

  // ===== לאחר טעינת הקבוצה =====
  useEffect(() => {
    console.log('Loaded group:', group);
  }, [group]);

  // ===== לאחר טעינת המועמדים =====
  useEffect(() => {
    console.log('Loaded candidates:', candidates);
  }, [candidates]);

  // ===== לאחר טעינת הקמפיינים לכל מועמד =====
  // ===== State לגרפים =====


  // ===== עדכון גרפים לאחר טעינת קמפיינים =====
  useEffect(() => {
    if (!candidatesWithCampaign || candidatesWithCampaign.length === 0) return;

    // Bar chart – כל המועמדים
    const bar = candidatesWithCampaign.map(c => ({
      name: c.name ? (c.name.length > 12 ? c.name.slice(0, 12) + '...' : c.name) : 'לא ידוע',
      likeCount: Number(c.campaign?.campaign?.likeCount || 0),
    }));

    // Pie chart – רק מועמדים עם לייקים
    const pie = candidatesWithCampaign
      .filter(c => Number(c.campaign?.campaign?.likeCount || 0) > 0)
      .map(c => ({
        name: c.name,
        value: Number(c.campaign.campaign.likeCount),
      }));

    setBarData(bar);
    setPieData(pie);

    console.log('Bar Data:', bar);
    console.log('Pie Data:', pie);
  }, [candidatesWithCampaign]);



  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupWithMembers(groupId));
      dispatch(fetchCandidatesByGroup(groupId));
    }
  }, [dispatch, groupId]); // <-- סוגר את ה-useEffect הראשון

  useEffect(() => {
    if (isAuthed) {
      dispatch(fetchMyGroups());
    }
  }, [dispatch, groupId, isAuthed]); // <-- useEffect השני

  useEffect(() => {
    async function loadCampaigns() {
      if (!candidates || candidates.length === 0) return;

      const updatedCandidates = await Promise.all(
        candidates.map(async (c) => {
          try {
            const result = await dispatch(fetchCampaign(c._id)).unwrap();
            return { ...c, campaign: result }; // מחזיר את הקמפיין לכל מועמד
          } catch (err) {
            console.error('Error fetching campaign for candidate', c._id, err);
            return { ...c, campaign: null };
          }
        })
      );

      setCandidatesWithCampaign(updatedCandidates);
    }

    loadCampaigns();
  }, [candidates, dispatch]);

  // ===== Resize bar =====
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

  // ===== טיפול בשגיאות / מצבי טעינה =====
  if (groupError) {
    return (
      <div className="group-detail-error">
        {t('groups.detail.error.loadFailed')}
        <button
          className="group-detail-back-btn"
          onClick={() => navigate('/groups')}
        >
          {t('groups.detail.buttons.backToList')}
        </button>
      </div>
    );
  }

  if (!groupId) {
    return <div className="loading-wrap">{t('groups.detail.loading')}</div>;
  }

  const now = new Date();
  let creationDate, candidateEndDate, endDate;

  let isCandidatePhase = false;
  let isVotingPhase = false;
  let isGroupExpired = false;

  if (group) {
    creationDate = group.creationDate ? new Date(group.creationDate) : null;
    candidateEndDate = group.candidateEndDate ? new Date(group.candidateEndDate) : null;
    endDate = group.endDate ? new Date(group.endDate) : null;

    if (creationDate && candidateEndDate) {
      isCandidatePhase = now >= creationDate && now <= candidateEndDate;
    }

    if (candidateEndDate && endDate) {
      isVotingPhase = now > candidateEndDate && now <= endDate;
    }

    if (endDate) {
      isGroupExpired = now > endDate;
    }
  }

  if (groupLoading || !group) {
    return <div className="loading-wrap">{t('groups.detail.loading')}</div>;
  }

  // candidateRequests מהשרת (מגיעים ב-getGroupById)
  const candidateRequests = group.candidateRequests || [];

  // סוף יום ההצבעה – 23:59:59 של אותו יום
  let endAt = group?.endDate ? new Date(group.endDate) : null;

  if (endAt) {
    endAt = new Date(
      endAt.getFullYear(),
      endAt.getMonth(),
      endAt.getDate(),
      23, 59, 59, 999
    );
  }

  const isExpired = endAt ? endAt < new Date() : false;

  // 🔒 קבוצה נעולה + לא מחובר כלל
  if (isLocked && !isAuthed) {
    return (
      <div className="page-wrap dashboard">
        <div className="page-header">
          <button
            className="back-btn"
            onClick={() => navigate('/groups')}
          >
            {t('groups.detail.buttons.backToGroups')}
          </button>

          <h2 className="page-title">
            {t('groups.detail.locked.title')}
          </h2>
          <p className="group-description">
            {t('groups.detail.locked.mustLogin')}
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
            {t('groups.detail.buttons.joinRequest')}
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
            {t('groups.detail.buttons.backToGroups')}
          </button>

          <h2 className="page-title">
            {t('groups.detail.locked.title')}
          </h2>
          <p className="group-description">
            {t('groups.detail.locked.notMember')}
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
    if (!dateString) return t('groups.detail.meta.notAvailable');
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);
  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.votesCount || 0) - (a.votesCount || 0),
  );



  console.log('Bar Data:', barData);
  console.log('Pie Data:', pieData);


  const winners = sortedCandidates.slice(0, group.maxWinners);
  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }


  return (
    <div className="page-wrap dashboard">
      {/* כפתור הפעלת המדריך */}
      {/* כפתור הפעלת המדריך */}
      {tourInitialized && (
        <button onClick={openTour} className="tour-fab">
          ?
        </button>
      )}

<div id="group-detail-header" className="page-header clean-header">
  <div className="header-title">
    {/* שם הקבוצה תמיד מלא */}
    <h2 className="group-name" title={group.name}>
      {group.name}
    </h2>

    {/* תיאור עם 'קרא עוד/קרא פחות' */}
    {group.description && (
      <div className={`group-description-container ${descExpanded ? 'expanded' : ''}`}>
        <p className="group-description">{group.description}</p>
        {group.description.length > 50 && (
          <button className="read-more-btn" onClick={toggleDesc}>
  {descExpanded ? (
        <>
          פחות <BiChevronUp size={18} style={{ verticalAlign: 'middle' }} />
        </>
      ) : (
        <>
          עוד <BiChevronDown size={18} style={{ verticalAlign: 'middle' }} />
        </>
      )}          </button>
        )}
      </div>
    )}
  </div>

  <div className="icon-btn-container">
    {isOwner && (
      <button
        id="settings-button"
        className="icon-btn"
        onClick={goSettings}
        title={t('groups.detail.buttons.settings')}
      >
        <FiSettings size={20} />
      </button>
    )}
    <button
      className="icon-btn"
      onClick={() => navigate('/groups')}
      title={t('groups.detail.buttons.backToGroups')}
    >
      <BiArrowBack size={20} />
    </button>
  </div>
</div>





      <div id="group-detail-meta" className="meta-and-button">
        <div className="group-meta">
          <div>
            <span className="meta-label">
              {t('groups.detail.meta.creationDate')}
            </span>
            <span className="meta-value">{formatDate(group.creationDate)}</span>
          </div>
          <div>
            <span className="meta-label">
              {t('groups.detail.meta.endDate')}
            </span>
            <span className="meta-value">{formatDate(group.endDate)}</span>
          </div>
          <div>
            <span className="meta-label">
              {t('groups.detail.meta.totalVotes')}
            </span>
            <span className="meta-value">{totalVotes}</span>
          </div>
        </div>

        {isVotingPhase && (
          <button
            id="vote-button"
            className="vote-btn"
            onClick={() => {
              if (!isAuthed) {
                toast.error(t('groups.detail.toast.mustLoginToVote'));
                return;
              }

              navigate(`/groups/${slug}/candidates`, {
                state: { groupId },
              });
            }}
          >
            {t('groups.detail.buttons.goVote')}
          </button>
        )}
      </div>

      {errorCandidates && (
        <p className="err">
          ⌛ {t('groups.detail.error.candidatesFailed')}: {errorCandidates}
        </p>
      )}

      {/* במובייל: טאבים למטה */}
      {isMobile && (
        <div id="mobile-tabs" className="mobile-tabs">
          <button
            className={`mobile-tab ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            מועמדים
          </button>
          <button
            className={`mobile-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            מידע וגרפים
          </button>
        </div>
      )}

      <div className="main-content-resizable" ref={containerRef}>
        {/* צד שמאל – מועמדים */}
        <div
          className={`left-section ${isMobile && activeTab !== 'candidates' ? 'hidden' : ''}`}
          style={!isMobile ? { width: `${leftWidth}%` } : {}}
        >
          <div id="candidates-section" className="candidates-container">
            <h3 className="section-title">
              {t('groups.detail.candidates.title')}
            </h3>

            {loadingCandidates && (
              <p>{t('groups.detail.candidates.loading')}</p>
            )}

            {!loadingCandidates && candidates.length > 0 && (
              <div className="candidates-grid">
                {sortedCandidates.map((c, index) => {
                  const winnerIndex = winners.findIndex((w) => w._id === c._id);

                  return (
                    <div
                      key={c._id}
                      id={`candidate-card-${c._id}`}
                      className={`candidate-card ${winnerIndex !== -1 ? 'winner' : ''}`}
                    >
                      {c.photoUrl && (
                        <img
                          src={c.photoUrl || '/h.jpg'}
                          alt={t('groups.detail.candidates.imageAlt')}
                          className="candidate-avatar"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/h.jpg';
                          }}
                        />
                      )}

                      {/* אם הקבוצה נגמרה והמועמד מנצח – הצג מקום */}
                      {isGroupExpired && winnerIndex !== -1 && (
                        <div className="winner-badge">
                          {winnerIndex + 1}
                        </div>
                      )}

                      {c.userId && (
                        <button
                          className="campaign-btn"
                          onClick={() => {
                            const candidateSlug = makeCandidateSlug(c.name || '');
                            // slug כבר מוגדר למעלה כ־slug של הקבוצה
                            navigate(`/campaign/${slug}/${candidateSlug}`, {
                              state: { groupId },
                            });
                          }}
                          title={t('groups.detail.candidates.myCampaignTitle')}
                        >
                          <FiZap size={16} />
                        </button>
                      )}


                      <div className="candidate-text">
                        <h4>{c.name}</h4>
                        {c.description && <p>{c.description}</p>}
                      </div>

                      {isGroupExpired && (
                        <div className="votes-count">
                          {c.votesCount || 0}{' '}
                          {t('groups.detail.candidates.cardVotesSuffix')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingCandidates && candidates.length === 0 && (
              <p>{t('groups.detail.candidates.none')}</p>
            )}
          </div>
        </div>

        {/* פס גרירה - רק במסכים גדולים */}
        {!isMobile && (
          <div
            className="resize-handle"
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="resize-line" />
          </div>
        )}

        {/* צד ימין – מידע / גרפים / טפסים */}
        <div
          className={`right-section ${isMobile && activeTab !== 'info' ? 'hidden' : ''}`}
          style={!isMobile ? { width: `${100 - leftWidth}%` } : {}}
        >
          {isCandidatePhase && (
            <div className="candidate-form-card">
              <CandidateApplyForm
                groupId={group._id}
                candidateRequests={candidateRequests}
              />
            </div>
          )}

          {isVotingPhase && (
            <div className="group-details-card">
              <div className="group-info-grid">
                {/* Info cards */}
                <div className="info-card">
                  <HiClock size={28} color="#1e3a8a" />
                  <p>{t('groups.detail.infoCards.timeLeft')}</p>
                  <CountdownTimer endDate={group.endDate} />
                </div>
                <div className="info-card">
                  <HiUserGroup size={28} color="#1e3a8a" />
                  <p>{t('groups.detail.infoCards.totalVotes')}</p>
                  <h4>{totalVotes}</h4>
                </div>
                <div className="info-card">
                  <HiUser size={28} color="#1e3a8a" />
                  <p>{t('groups.detail.infoCards.candidatesCount')}</p>
                  <h4>{candidates.length}</h4>
                </div>
                <div className="info-card">
                  <HiOutlineBadgeCheck size={28} color="#1e3a8a" />
                  <p>{t('groups.detail.infoCards.winnersCount')}</p>
                  <h4>{group.maxWinners}</h4>
                </div>
              </div>

              {/* גרפים – מחוץ ל-grid */}
{/* גרפים – מחוץ ל-grid */}
{candidatesWithCampaign &&
 candidatesWithCampaign.length > 0 &&
 barData.some((c) => c.likeCount > 0) && (
  <div className="survey-card">
    <h3>סקר תמיכה (לא תוצאות רשמיות)</h3>
    <p className="survey-note">
      נתוני הסקר מתבססים על תמיכה בקמפיין. רק מועמד עם קמפיין פעיל יכול לקבל תמיכה.
    </p>

    <div className="survey-charts-container">
      {/* Bar Chart */}
      <div className="survey-chart chart-bar">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
            <YAxis />
            <Tooltip formatter={(v) => `${v} תמיכה`} labelFormatter={() => ''} />
            <Bar dataKey="likeCount">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="survey-chart chart-pie">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v} תמיכה`} labelFormatter={() => ''} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
)}


            </div>
          )}


          {isGroupExpired && totalVotes > 0 && (
            <div className="charts">
              <div className="pie-chart-container">
                <h3>{t('groups.detail.charts.pieTitle')}</h3>
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
                    <Tooltip
                      formatter={(v) =>
                        `${v} ${t(
                          'groups.detail.charts.tooltipVotesSuffix',
                        )}`
                      }
                    />
                    <Legend verticalAlign="bottom" height={25} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bar-chart-container">
                <h3>{t('groups.detail.charts.barTitle')}</h3>
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
                    <Tooltip
                      formatter={(v) =>
                        `${v} ${t(
                          'groups.detail.charts.tooltipVotesSuffix',
                        )}`
                      }
                    />
                    <Bar dataKey="votesCount" fill="#003366" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {isGroupExpired && totalVotes === 0 && (
            <div className="no-votes-message">
              {t('groups.detail.charts.noVotes')}
            </div>
          )}
        </div>
      </div>

      {/* כפתור צ'אט צף בצד ימין למטה – יוצג רק אם המשתמש מחובר */}
      {isAuthed && (
        <>
          <button
            id="chat-fab"
            type="button"
            className="chat-fab"
            onClick={() => setIsChatOpen((prev) => !prev)}
          >
            {isChatOpen ? <FiX size={20} /> : <FiMessageSquare size={20} />}
          </button>
       {isChatOpen && (
  <div className="chat-panel" id="group-chat-panel">
    <div className="chat-panel-header" />
    <GroupChat
      groupId={groupId}
      canChat={canChat}
      currentUserId={myId}
      isOwner={isOwner}
    />
  </div>
)}

        </>
      )}
    </div>
  );


}
export default function GroupDetailPage() {
  return (
    <TourProvider
      steps={[]}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: 10,
        }),
      }}
    >
      <GroupDetailPageContent />
    </TourProvider>
  );
}