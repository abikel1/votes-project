// client/src/pages/VotingDragPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { fetchGroupOnly } from '../../slices/groupsSlice';
import {
  fetchCandidatesByGroup,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup,
} from '../../slices/candidateSlice';
import {
  voteForCandidate,
  checkHasVoted
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

  // אם אין לנו id מ-state, נטען אותו מהשרת לפי ה-slug
  useEffect(() => {
    if (navGroupId) {
      setGroupId(navGroupId);
      return;
    }

    // אין slug ב-URL? אין מה לעשות
    if (!groupSlug) return;
if (!isAuthed) {
  toast.error('אינך מחובר/ת. כדי להצביע צריך להתחבר.');
  return null;
}

    (async () => {
      try {
        const { data } = await http.get(`/groups/slug/${groupSlug}`);
        setGroupId(data._id);   // שומר את ה-id של הקבוצה
      } catch (err) {
        console.error('failed to resolve group by slug', err);
        setGroupId(null);
      }
    })();
  }, [navGroupId, groupSlug]);


  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [draggedSlip, setDraggedSlip] = useState(null);
  const [slipInEnvelope, setSlipInEnvelope] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDraggingEnvelope, setIsDraggingEnvelope] = useState(false);
  const [envelopePosition, setEnvelopePosition] = useState({ x: 0, y: 0 });

  const { selectedGroup: group } = useSelector(s => s.groups);
  const candidates = useSelector(selectCandidatesForGroup(groupId || '')) || [];
  const candLoading = useSelector(selectCandidatesLoadingForGroup(groupId || ''));
  const candError = useSelector(selectCandidatesErrorForGroup(groupId || ''));
  const userId = useSelector(s => s.auth?.userId || null);
  const hasVoted = useSelector(s => s.votes.hasVoted);

  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupOnly(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
  }, [dispatch, groupId]);

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
      await dispatch(voteForCandidate({
        groupId,
        candidateId: slipInEnvelope._id
      })).unwrap();

      if (userId) {
        // localStorage.setItem(`voted:${groupId}:${userId}`, '1');
      }
      await dispatch(fetchCandidatesByGroup(groupId));
    } catch (err) {
      const msg = String(err || '');
      if (msg.includes('already voted') || msg.includes('כבר הצבעת')) {
        // if (userId) localStorage.setItem(`voted:${groupId}:${userId}`, '1');
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
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  if (!groupId) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
        <div>טוען...</div>
      </div>
    );
  }

  if (candLoading) {
    return (
      <div className="vd-wrap">
        <h2>דף הצבעה</h2>
        <div>טוען...</div>
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
          onClick={() => navigate(`/groups/${groupSlug}`, { state: { groupId } })}
        >
          ← חזור לפרטי הקבוצה
        </button>

        <h2>דף הצבעה</h2>
        {group && <div className="vd-group-name">{group.name}</div>}
      </div>

      <div className="vd-container">
        <div className="vd-slips-area">
          <div className="vd-slips-grid">
            {candidates.map(c => (
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
                  <img src={c.photoUrl} alt={c.name} className="vd-slip-photo" />
                ) : (
                  <div className="vd-slip-photo-placeholder">👤</div>
                )}

                <h4 className="vd-slip-name">{c.name || 'ללא שם'}</h4>
                {c.symbol && <span className="vd-slip-symbol">{c.symbol}</span>}
                {/* {c.description && <p className="vd-slip-desc">{c.description}</p>} */}
                {/* <div className="vd-slip-votes">{c.votesCount || 0} קולות</div> */}
              </div>
            ))}
          </div>

        </div>

        <div className="vd-voting-area">

          <div
            className={`vd-envelope ${slipInEnvelope ? 'vd-envelope-full' : ''} ${hasVoted ? 'vd-envelope-voted' : ''}`}
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
                <div className="vd-slip-symbol-small">{slipInEnvelope.symbol || slipInEnvelope.name?.substring(0, 2)}</div>
              </div>
            ) : (
              <div className="vd-envelope-label">גרור פתק לכאן</div>
            )}
          </div>

          <div className="vd-arrow">↓</div>

          <div
            className={`vd-ballot ${hasVoted ? 'vd-ballot-voted' : ''}`}
            onDragOver={handleBallotDragOver}
            onDrop={handleBallotDrop}
          >
            <div className="vd-ballot-slot"></div>
            <div className="vd-ballot-label">
              {hasVoted ? 'הצבעתך נקלטה בהצלחה' : 'גרור מעטפה לקלפי'}
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
            pointerEvents: 'none'
          }}
        >
          <div className="vd-envelope-flap"></div>
          <div className="vd-slip-in-envelope">
            <div className="vd-slip-symbol-small">{slipInEnvelope.symbol || slipInEnvelope.name?.substring(0, 2)}</div>
          </div>
        </div>
      )}

      {showModal && selectedCandidate && (
        <div className="vd-modal-overlay" onClick={closeModal}>






          <div className="vd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="vd-modal-close" onClick={closeModal}>×</button>
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
                {selectedCandidate.symbol || selectedCandidate.name?.substring(0, 2) || '??'}
              </div>
              <h3>{selectedCandidate.name || 'ללא שם'}</h3>
            </div>
            {selectedCandidate.description && (
              <div className="vd-modal-desc">{selectedCandidate.description}</div>
            )}
            {selectedCandidate.photoUrl && (
              <div className="vd-modal-photo">
                <img src={selectedCandidate.photoUrl} alt={selectedCandidate.name} />
              </div>
            )}
            {/* <div className="vd-modal-votes">
              קולות: <strong>{selectedCandidate.votesCount ?? 0}</strong>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}