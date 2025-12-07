import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

import {
  fetchGroupOnly,
  fetchMyGroups,
  selectMyJoinedIds,
} from '../../slices/groupsSlice';

import {
  fetchCandidatesByGroup,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup,
} from '../../slices/candidateSlice';

import {
  voteForCandidate,
  checkHasVoted,
} from '../../slices/votesSlice';

import './VotingPage.css';
import { toast } from 'react-hot-toast';
import http from '../../api/http';
import { useTranslation } from 'react-i18next';

export default function VotingDragPage() {
  const { groupSlug } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  // id שהגיע מניווט פנימי (כפתור "להצבעה בקלפי")
  const navGroupId = location.state?.groupId || null;
  // state פנימי ל-id
  const [groupId, setGroupId] = useState(navGroupId);
  const [slugResolved, setSlugResolved] = useState(!!navGroupId);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // נתוני משתמש
  const { userId, userEmail, firstName, lastName, isAdmin } = useSelector(
    (s) => s.auth,
  );


  // קבוצות שאני חברה בהן
  const joinedIdsSet = useSelector(selectMyJoinedIds);

  const {
    selectedGroup: group,
    loading: groupLoading,
    error: groupError,
  } = useSelector((s) => s.groups);

  const candidates =
    useSelector(selectCandidatesForGroup(groupId || '')) || [];
  const candLoading = useSelector(
    selectCandidatesLoadingForGroup(groupId || ''),
  );
  const candError = useSelector(
    selectCandidatesErrorForGroup(groupId || ''),
  );
  const hasVoted = useSelector((s) => s.votes.hasVoted);

  const [draggedSlip, setDraggedSlip] = useState(null);
  const [slipInEnvelope, setSlipInEnvelope] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDraggingEnvelope, setIsDraggingEnvelope] = useState(false);
  const [envelopePosition, setEnvelopePosition] = useState({ x: 0, y: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [candidateToVote, setCandidateToVote] = useState(null);
  const [hasCheckedForGroup, setHasCheckedForGroup] = useState(false);
  const hasShownAlreadyVotedToast = useRef(false); // 👈 חדש – כדי לא להראות פעמיים
  const justVotedRef = useRef(false);
  // --- פתרון slug ל-id כשנכנסים ישירות ל-URL ---
  useEffect(() => {
    // אם הגיע id מהניווט – משתמשים בו
    if (navGroupId) {
      setGroupId(navGroupId);
      setSlugResolved(true);
      return;
    }

    if (!groupSlug) return;

    (async () => {
      try {
        const { data } = await http.get(`/groups/slug/${groupSlug}`);
        setGroupId(data._id); // id של הקבוצה
      } catch (err) {
        console.error('failed to resolve group by slug', err);
        setGroupId(null);
      } finally {
        setSlugResolved(true);
      }
    })();
  }, [navGroupId, groupSlug]);

  // טעינת נתוני קבוצה + מועמדים
  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupOnly(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
  }, [dispatch, groupId]);

  // טעינת הקבוצות שאני חברה בהן
  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchMyGroups());
  }, [dispatch, groupId]);

  // בדיקה אם כבר הצבעתי
  // בדיקה אם כבר הצבעתי לקבוצה הזו (עם סימון שסיימנו לבדוק)
  useEffect(() => {
    if (!groupId) return;

    // מתחילים בדיקה חדשה לקבוצה הזו
    setHasCheckedForGroup(false);

    dispatch(checkHasVoted({ groupId }))
      .unwrap()
      .catch((err) => {
        console.error('checkHasVoted failed:', err);
      })
      .finally(() => {
        // סיימנו לבדוק מול השרת עבור הקבוצה הזו
        setHasCheckedForGroup(true);
      });
  }, [dispatch, groupId]);
  // כשהקבוצה מתחלפת – מאפסים דגלים של טוסטים
  useEffect(() => {
    hasShownAlreadyVotedToast.current = false;
    justVotedRef.current = false;
  }, [groupId]);

  // אחרי שסיימנו לבדוק מול השרת – אם כבר הצבענו בקבוצה הזו, מציגים טוסט
  // אחרי שסיימנו לבדוק מול השרת – אם כבר הצבענו בקבוצה הזו, מציגים טוסט (רק אם לא הצבענו עכשיו)
  useEffect(() => {
    if (!groupId) return;
    if (!hasCheckedForGroup) return;          // עדיין לא סיימנו בדיקה לקבוצה זו
    if (!hasVoted) return;                    // השרת אמר שלא הצבענו – לא מציגים כלום
    if (justVotedRef.current) return;         // 👈 הצבענו עכשיו – לא להציג "כבר הצבעת"
    if (hasShownAlreadyVotedToast.current) return; // 👈 שלא יהיה פעמיים

    toast(
      t(
        'voting.alreadyVotedThisGroup',
        'כבר הצבעת לקבוצה זו, לא ניתן להצביע שוב.'
      ),
      { icon: 'ℹ️' }
    );

    hasShownAlreadyVotedToast.current = true; // שלא יוצג שוב לכניסות חוזרות בעמוד
  }, [groupId, hasCheckedForGroup, hasVoted, t]);

  const confirmVote = (candidate) => {
    if (hasVoted) return;
    setCandidateToVote(candidate);
    setShowConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (!candidateToVote) return;

    // 🔵 הכנס למעטפה
    setSlipInEnvelope(candidateToVote);

    setShowConfirmModal(false);

    // 🔵 ואז מבצעים את השליחה
    await voteForCandidateToBallot();

    setCandidateToVote(null);
  };


  const handleCancelVote = () => {
    setShowConfirmModal(false);
    setCandidateToVote(null);
  };
  const attemptVote = (candidate) => {
    if (!candidate || hasVoted || isSubmitting) return;

    // 🔵 פותחים מודל אישור
    setCandidateToVote(candidate);
    setShowConfirmModal(true);
  };



  const handleSlipDragStart = (e, candidate) => {
    if (hasVoted) return;
    setDraggedSlip(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEnvelopeDragOver = (e) => {
    if (!draggedSlip || hasVoted) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEnvelopeDrop = (e) => {
    e.preventDefault();
    if (!draggedSlip || hasVoted) return;
    setSlipInEnvelope(draggedSlip);
    setDraggedSlip(null);
  };

  const handleBallotDragOver = (e) => {
    if (!slipInEnvelope || hasVoted) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // const handleBallotDrop = async (e) => {
  //   e.preventDefault();
  //   if (!slipInEnvelope || hasVoted || isSubmitting) return;

  //   setIsDraggingEnvelope(false);
  //   setEnvelopePosition({ x: 0, y: 0 });

  //   try {
  //     setIsSubmitting(true);
  //     await dispatch(
  //       voteForCandidate({
  //         groupId,
  //         candidateId: slipInEnvelope._id,
  //       }),
  //     ).unwrap();

  //     await dispatch(fetchCandidatesByGroup(groupId));
  //   } catch (err) {
  //     const msg = String(err || '');
  //     if (
  //       msg.includes('already voted') ||
  //       msg.includes('כבר הצבעת')
  //     ) {
  //       // נתעלם, הסטייט יתעדכן מהשרת
  //     } else {
  //       toast.error(t('voting.voteErrorPrefix') + msg);
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };


  const handleBallotDrop = (e) => {
    e.preventDefault();
    if (!slipInEnvelope) return;

    // 🔵 אם אין מועמד לאישור — מבקשים אישור
    if (!candidateToVote) {
      attemptVote(slipInEnvelope);
      return;
    }

    // 🔵 אחרי אישור – מצביעים
    voteForCandidateToBallot();
  };

  const voteForCandidateToBallot = async () => {
    if (!slipInEnvelope || !groupId) return;

    setIsSubmitting(true);
    setIsDraggingEnvelope(false);
    setEnvelopePosition({ x: 0, y: 0 });

    // 👈 מסמנים שכבר "בהצבעה" לפני ש־hasVoted מתעדכן ב־Redux
    justVotedRef.current = true;

    try {
      await dispatch(
        voteForCandidate({
          groupId,
          candidateId: slipInEnvelope._id,
        })
      ).unwrap();

      // ✅ טוסט הצבעה נקלטה
      toast(t('voting.voteSuccessToast'), { icon: '🗳️' });

      // 👇 דואגים שגם טוסט "כבר הצבעת" לא יקפוץ באותו סשן
      hasShownAlreadyVotedToast.current = true;

      dispatch(fetchCandidatesByGroup(groupId));
      setSlipInEnvelope(null);
    } catch (err) {
      const msg = String(err || '');

      // ❌ אם הייתה שגיאה – לא נחשיב את זה כהצבעה מוצלחת
      justVotedRef.current = false;
      hasShownAlreadyVotedToast.current = false;

      if (!msg.includes('already voted') && !msg.includes('כבר הצבעת')) {
        toast.error(t('voting.voteErrorPrefix') + msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnvelopeDragStart = (e) => {
    if (!slipInEnvelope || hasVoted) return;
    setIsDraggingEnvelope(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
  };

  const handleEnvelopeDrag = (e) => {
    if (!isDraggingEnvelope || e.clientX === 0) return;
    setEnvelopePosition({ x: e.clientX, y: e.clientY });
  };

  const handleEnvelopeDragEnd = () => {
    setIsDraggingEnvelope(false);
    setEnvelopePosition({ x: 0, y: 0 });
  };

  const openModal = (candidate) => {
    if (hasVoted) return;
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  // ----------- מצבי טעינה / שגיאה בסיסיים -----------

  if (!slugResolved && !groupId) {
    return (
      <div className="vd-wrap">
        <h2>{t('voting.pageTitle')}</h2>
        <div>{t('voting.loadingGroup')}</div>
      </div>
    );
  }

  if (slugResolved && !groupId) {
    return (
      <div className="vd-wrap">
        <h2>{t('voting.pageTitle')}</h2>
        <div className="vd-error">{t('voting.groupNotFound')}</div>
        <button
          className="vd-back-button"
          onClick={() => navigate('/groups')}
        >
          ← {t('voting.backToGroupsList')}
        </button>
      </div>
    );
  }

  if (groupLoading || !group) {
    return (
      <div className="vd-wrap">
        <h2>{t('voting.pageTitle')}</h2>
        <div>{t('voting.loadingGroup')}</div>
      </div>
    );
  }

  if (groupError) {
    return (
      <div className="vd-wrap">
        <h2>{t('voting.pageTitle')}</h2>
        <div className="vd-error">{groupError}</div>
      </div>
    );
  }

  // ----------- בדיקת הרשאות להצבעה -----------

  const gidStr = String(groupId);

  const isMember =
    !!joinedIdsSet &&
    typeof joinedIdsSet.has === 'function' &&
    joinedIdsSet.has(gidStr);

  // זיהוי מנהלת הקבוצה (כמו בדף פרטי קבוצה)
  const myEmail = (userEmail || localStorage.getItem('userEmail') || '')
    .trim()
    .toLowerCase();
  const myId = String(userId ?? localStorage.getItem('userId') ?? '');

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
    isAdmin ||                                         // 👑 אדמין נחשב כמו בעל הקבוצה
    !!group.isOwner ||
    (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
    (!!myId && !!createdById && myId === createdById);


  // קבוצה נעולה + לא חברה בקבוצה + לא מנהלת → חסימה
  if (group.isLocked && !isMember && !isOwner) {
    return (
      <div className="vd-wrap">
        <h2>{t('voting.pageTitle')}</h2>
        <div className="vd-error">
          {t('voting.notMemberText', { groupName: group.name })}
          <br />
          {t('voting.notMemberHelp')}
        </div>
        <div className="vd-actions">
          <button
            className="vd-back-button"
            onClick={() =>
              navigate(`/groups/${groupSlug}`, { state: { groupId } })
            }
          >
            {t('voting.goToGroupPage')}
          </button>
          <button
            className="vd-back-button"
            onClick={() => navigate('/groups')}
          >
            {t('voting.goToAllGroups')}
          </button>
        </div>
      </div>
    );
  }

  // ----------- מכאן – מותר להצביע -----------

  if (candLoading) {
    return (
      <div className="vd-wrap">
        <h2>{t('voting.pageTitle')}</h2>
        <div>{t('voting.loadingCandidates')}</div>
      </div>
    );
  }

  if (candError) {
    return (
      <div className="vd-wrap">
        <h2>{t('voting.pageTitle')}</h2>
        <div className="vd-error">{candError}</div>
      </div>
    );
  }

  if (!candidates?.length) {
    return (
      <div className="vd-wrap">
        <h2>{t('voting.pageTitle')}</h2>
        <div className="vd-empty">{t('voting.noCandidates')}</div>
      </div>
    );
  }

  return (
    <div className="vd-wrap">
      <div className="vd-header">
        <button
          className="vd-back-button"
          onClick={() =>
            navigate(`/groups/${groupSlug}`, { state: { groupId } })
          }
        >
          ← {t('voting.backToGroupDetails')}
        </button>

        <h2>{t('voting.pageTitle')}</h2>
        {group && <div className="vd-group-name">{group.name}</div>}
      </div>

      <div className="vd-container">
        <div className="vd-slips-area">
          <div className="vd-slips-grid">
            {candidates.map((c) => (
              <div
                key={c._id}
                className={`vd-slip 
                  ${slipInEnvelope?._id === c._id ? 'vd-slip-used' : ''} 
                  ${hasVoted ? 'vd-slip-disabled' : ''}`}
                draggable={!hasVoted && slipInEnvelope?._id !== c._id}
                onDragStart={(e) => handleSlipDragStart(e, c)}
                onClick={() => openModal(c)}
              >
                {c.photoUrl ? (



                  <img
                    src={c.photoUrl || '/h.jpg'}           // אם אין URL – ברירת מחדל
                    alt={
                      c.name
                        ? t('candidates.list.photoAltWithName', { name: c.name })
                        : t('candidates.list.photoAlt')
                    }
                    className="vd-slip-photo"
                    onError={(e) => {
                      e.currentTarget.onerror = null;      // מונע loop אם גם הברירת מחדל לא קיימת
                      e.currentTarget.src = '/h.jpg';     // מציב ברירת מחדל במקרה של שגיאה בטעינה
                    }}
                  />

                ) : (
                  <div className="vd-slip-photo-placeholder">👤</div>
                )}

                <h4 className="vd-slip-name">
                  {c.name || t('voting.noName')}
                </h4>
                {c.symbol && (
                  <span className="vd-slip-symbol">{c.symbol}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="vd-voting-area">
          <div
            className={`vd-envelope ${slipInEnvelope ? 'vd-envelope-full' : ''
              } ${hasVoted ? 'vd-envelope-voted' : ''}`}
            onDragOver={handleEnvelopeDragOver}
            onDrop={handleEnvelopeDrop}
            draggable={Boolean(slipInEnvelope && !hasVoted)}
            onDragStart={handleEnvelopeDragStart}
            onDrag={handleEnvelopeDrag}
            onDragEnd={handleEnvelopeDragEnd}
          >
            <div className="vd-envelope-flap"></div>
            {slipInEnvelope ? (
              <div className="vd-slip-in-envelope">
                <div className="vd-slip-symbol-small">
                  {slipInEnvelope.symbol ||
                    slipInEnvelope.name?.substring(0, 2)}
                </div>
              </div>
            ) : (
              <div className="vd-envelope-label">
                {t('voting.dragSlipHere')}
              </div>
            )}
          </div>
          <button
            className="vd-insert-button"
            disabled={!slipInEnvelope || hasVoted}
            // 🔵 תמיד מצביעים עבור slipInEnvelope
            onClick={() => attemptVote(slipInEnvelope)}
          >
            {t('voting.insertEnvelope')}
          </button>


          <div className="vd-arrow">↓</div>

          <div
            className={`vd-ballot ${hasVoted ? 'vd-ballot-voted' : ''
              }`}
            onDragOver={handleBallotDragOver}
            onDrop={handleBallotDrop}
          >
            <div className="vd-ballot-slot"></div>
            <div className="vd-ballot-label">
              {hasVoted
                ? t('voting.voteSuccess')
                : t('voting.dragEnvelopeToBallot')}
            </div>
          </div>


        </div>
      </div>

      {isDraggingEnvelope && slipInEnvelope && (
        <div
          className="vd-envelope-dragging"
          style={{
            left: `${envelopePosition.x - 140}px`,
            top: `${envelopePosition.y - 90}px`,
            pointerEvents: 'none',
          }}
        >
          <div className="vd-envelope-flap"></div>
          <div className="vd-slip-in-envelope">
            <div className="vd-slip-symbol-small">
              {slipInEnvelope.symbol ||
                slipInEnvelope.name?.substring(0, 2)}
            </div>
          </div>
        </div>
      )}

      {showModal && selectedCandidate && (
        <div className="vd-modal-overlay" onClick={closeModal}>
          <div
            className="vd-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="vd-modal-close"
              onClick={closeModal}
            >
              ×
            </button>
            <div className="vd-modal-header">
              <button
                className="vd-select-button"
                onClick={() => {
                  setSlipInEnvelope(selectedCandidate);
                  closeModal();
                }}
              >

                {t('voting.selectForVote')}
              </button>

              <div className="vd-modal-symbol">
                {selectedCandidate.symbol ||
                  selectedCandidate.name?.substring(0, 2) ||
                  '??'}
              </div>
              <h3>{selectedCandidate.name || t('voting.noName')}</h3>
            </div>
            {selectedCandidate.description && (
              <div className="vd-modal-desc">
                {selectedCandidate.description}
              </div>
            )}
            {selectedCandidate.photoUrl && (
              <div className="vd-modal-photo">
                <img
                  src={selectedCandidate.photoUrl}
                  alt={selectedCandidate.name}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={showConfirmModal}
        message={
          candidateToVote
            ? t('voting.confirmVoteMessage', { name: candidateToVote.name || '' })
            : ''
        } onConfirm={handleConfirmVote}
        onCancel={handleCancelVote}
      />

    </div>


  );
}
