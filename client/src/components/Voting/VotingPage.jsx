// client/src/pages/VotingDragPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

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

export default function VotingDragPage() {
  const { groupSlug } = useParams();
  const location = useLocation();

  // id שהגיע מניווט פנימי (כפתור "להצבעה בקלפי")
  const navGroupId = location.state?.groupId || null;

  // state פנימי ל-id
  const [groupId, setGroupId] = useState(navGroupId);
  const [slugResolved, setSlugResolved] = useState(!!navGroupId);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // נתוני משתמש
  const { userId, userEmail, firstName, lastName } = useSelector(
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
  useEffect(() => {
    if (!groupId) return;
    dispatch(checkHasVoted({ groupId }));
  }, [dispatch, groupId]);

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

  const handleBallotDrop = async (e) => {
    e.preventDefault();
    if (!slipInEnvelope || hasVoted || isSubmitting) return;

    setIsDraggingEnvelope(false);
    setEnvelopePosition({ x: 0, y: 0 });

    try {
      setIsSubmitting(true);
      await dispatch(
        voteForCandidate({
          groupId,
          candidateId: slipInEnvelope._id,
        }),
      ).unwrap();

      await dispatch(fetchCandidatesByGroup(groupId));
    } catch (err) {
      const msg = String(err || '');
      if (
        msg.includes('already voted') ||
        msg.includes('כבר הצבעת')
      ) {
        // נתעלם, הסטייט יתעדכן מהשרת
      } else {
        toast.error('שגיאה בהצבעה: ' + msg);
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
        <h2>דף הצבעה</h2>
        <div>טוען נתוני קבוצה...</div>
      </div>
    );
  }

  if (slugResolved && !groupId) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
        <div className="vd-error">הקבוצה לא נמצאה.</div>
        <button
          className="vd-back-button"
          onClick={() => navigate('/groups')}
        >
          ← חזרה לרשימת הקבוצות
        </button>
      </div>
    );
  }

  if (groupLoading || !group) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
        <div>טוען נתוני קבוצה...</div>
      </div>
    );
  }

  if (groupError) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
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
    !!group.isOwner ||
    (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
    (!!myId && !!createdById && myId === createdById);

  // קבוצה נעולה + לא חברה בקבוצה + לא מנהלת → חסימה
  if (group.isLocked && !isMember && !isOwner) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
        <div className="vd-error">
          נראה שאינך מחובר/ת לקבוצה{' '}
          <strong>{group.name}</strong>, ולכן לא ניתן להצביע בה.
          <br />
          כדי להשתתף בהצבעה יש להצטרף לקבוצה ולהמתין לאישור מנהל/ת
          הקבוצה.
        </div>
        <div className="vd-actions">
          <button
            className="vd-back-button"
            onClick={() =>
              navigate(`/groups/${groupSlug}`, { state: { groupId } })
            }
          >
            מעבר לדף הקבוצה
          </button>
          <button
            className="vd-back-button"
            onClick={() => navigate('/groups')}
          >
            לרשימת כל הקבוצות
          </button>
        </div>
      </div>
    );
  }

  // ----------- מכאן – מותר להצביע -----------

  if (candLoading) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
        <div>טוען מועמדים...</div>
      </div>
    );
  }

  if (candError) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
        <div className="vd-error">{candError}</div>
      </div>
    );
  }

  if (!candidates?.length) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
        <div className="vd-empty">אין מועמדים בקבוצה</div>
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
          ← חזור לפרטי הקבוצה
        </button>

        <h2>דף הצבעה</h2>
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
                    src={c.photoUrl}
                    alt={c.name}
                    className="vd-slip-photo"
                  />
                ) : (
                  <div className="vd-slip-photo-placeholder">👤</div>
                )}

                <h4 className="vd-slip-name">
                  {c.name || 'ללא שם'}
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
            className={`vd-envelope ${
              slipInEnvelope ? 'vd-envelope-full' : ''
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
              <div className="vd-envelope-label">גרור פתק לכאן</div>
            )}
          </div>

          <div className="vd-arrow">↓</div>

          <div
            className={`vd-ballot ${
              hasVoted ? 'vd-ballot-voted' : ''
            }`}
            onDragOver={handleBallotDragOver}
            onDrop={handleBallotDrop}
          >
            <div className="vd-ballot-slot"></div>
            <div className="vd-ballot-label">
              {hasVoted
                ? 'הצבעתך נקלטה בהצלחה'
                : 'גרור מעטפה לקלפי'}
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
                בחר להצבעה
              </button>

              <div className="vd-modal-symbol">
                {selectedCandidate.symbol ||
                  selectedCandidate.name?.substring(0, 2) ||
                  '??'}
              </div>
              <h3>{selectedCandidate.name || 'ללא שם'}</h3>
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
    </div>
  );
}
