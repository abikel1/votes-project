import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCampaign,
  addPost,
  deletePost,
  addImage,
  deleteImage,
  updateCampaign,
  incrementView,
  selectCampaign,
  selectCandidate,
  generatePostSuggestion,
  selectAiSuggestion,
  selectAiLoading,
  selectAiError,
  addComment,
  deleteComment,
  toggleLike 
} from '../../slices/campaignSlice';
import { updateCandidate } from '../../slices/candidateSlice';


import { BiArrowBack } from 'react-icons/bi';
import { FiEdit3, FiEye, FiHeart, FiShare2, FiX } from 'react-icons/fi';

import './CampaignPage.css';
import { uploadImage } from '../../components/GroupSettings/uploadImage';
import PostCard from './PostCard';
// עוזר לניקוי תשובת AI

import EditCandidateModal from '../../components/GroupSettings/EditCandidateModal';
import http from '../../api/http';

// ===== עוזר לניקוי תשובת ה-AI =====
function normalizeAiSuggestion(suggestion, fallbackTitle = '') {
  if (!suggestion) {
    return { title: fallbackTitle || '', content: '', youtubeUrl: '' };
  }

  const rawTitle =
    suggestion.title !== undefined && suggestion.title !== null
      ? suggestion.title
      : fallbackTitle || '';

  const rawContent =
    suggestion.content ?? suggestion.text ?? suggestion.message ?? '';

  if (typeof rawContent !== 'string') {
    return { title: rawTitle, content: '', youtubeUrl: '' };
  }

  try {
    let jsonText = rawContent;
    const codeBlockMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    }

    const braceMatch = jsonText.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      jsonText = braceMatch[0];
    }

    const obj = JSON.parse(jsonText);

    if (obj && (obj.title || obj.content)) {
      return {
        title: obj.title || rawTitle,
        content: obj.content || '',
        youtubeUrl: obj.youtubeUrl || '',
      };
    }
  } catch (e) {
    // אין JSON תקין
  }

  return {
    title: rawTitle,
    content: rawContent,
    youtubeUrl: '',
  };
}



export default function CampaignPage() {
  const { candidateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const groupId = location.state?.groupId || null;
  // Redux state
  const campaign = useSelector(selectCampaign);
  const candidate = useSelector(selectCandidate);
  const campaignLoading = useSelector((state) => state.campaign.loading);
  const campaignError = useSelector((state) => state.campaign.error);
  const currentUserId = useSelector((state) => state.auth.userId);
  const userLoading = useSelector((state) => state.auth.loading);

  const aiSuggestion = useSelector(selectAiSuggestion);
  const aiLoading = useSelector(selectAiLoading);
  const aiError = useSelector(selectAiError);

  // Local state
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    youtubeUrl: '' 
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
const [hasLiked, setHasLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // AI modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);

  const hasIncrementedViewRef = useRef(false);

// <<<<<<< HEAD
// =======
  // === NEW: סטייט למודאל עריכת מועמד ===
  const [editCandidateOpen, setEditCandidateOpen] = useState(false);
  const [editCandForm, setEditCandForm] = useState({
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
  });
  const [editCandErrors, setEditCandErrors] = useState({});
  const [updatingThisCandidate, setUpdatingThisCandidate] = useState(false);
  const [updateCandidateError, setUpdateCandidateError] = useState('');
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const editFileInputRef = useRef(null);

  const effectiveGroupId = groupId || campaign?.groupId || null;
  // === פונקציה נוחה לריענון הקמפיין מהשרת אחרי פעולות עריכה ===
// >>>>>>> f626efaa96775a3bd42eed6f5e1db18dfb2f900a
  const refetchCampaign = () => {
    if (!candidateId) return;
    dispatch(fetchCampaign(candidateId));
  };

  const handleToggleLike = async () => {
  try {
    const result = await dispatch(toggleLike(campaign._id)).unwrap();
    setLikeCount(result.likeCount);
    setHasLiked(result.liked);
  } catch (err) {
    console.error('שגיאה בלייק:', err);
  }
};

  // טעינת קמפיין + incrementView
  useEffect(() => {
    if (!candidateId) return;

    hasIncrementedViewRef.current = false;

    dispatch(fetchCampaign(candidateId))
      .unwrap()
      .then((res) => {
        const campaignId = res?.campaign?._id || res?._id;

        if (campaignId && !hasIncrementedViewRef.current) {
          hasIncrementedViewRef.current = true;

          dispatch(incrementView(campaignId)).catch((err) => {
            console.error('שגיאה בעדכון צפיות:', err);
          });
        }
      })
      .catch((err) => {
        console.error('שגיאה בטעינת קמפיין:', err);
      });
  }, [candidateId, dispatch]);

  // סנכרון תיאור ולייקים
  // useEffect(() => {
  //   if (campaign) {
  //     if (campaign.description !== undefined) {
  //       setEditDescription(campaign.description);
  //     }
  //     if (campaign.likeCount !== undefined) {
  //       setLikeCount(campaign.likeCount);
  //     }
  //   }
  // }, [campaign]);

useEffect(() => {
  if (campaign && currentUserId) {
    setLikeCount(campaign.likes?.length || 0);
    setHasLiked(campaign.likes?.includes(currentUserId) || false);
  }
}, [campaign, currentUserId]);


console.log("campaign.liked:", campaign?.liked);

  // AI suggestion
  useEffect(() => {
    if (aiSuggestion) {
      const normalized = normalizeAiSuggestion(aiSuggestion, newPost.title);
      setNewPost(normalized);
      setAiGenerated(true);
    }
  }, [aiSuggestion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading states
  if (userLoading) return <div className="loading-wrap">טוען משתמש…</div>;
  if (campaignLoading || !campaign)
    return <div className="loading-wrap">טוען קמפיין…</div>;
  if (campaignError) return <div className="err">שגיאה: {campaignError}</div>;

  const candidateUserId = candidate?.userId;
  const isCandidateOwner =
    currentUserId &&
    candidateUserId &&
    currentUserId.toString() === candidateUserId.toString();

  const viewCount = campaign.viewCount || 0;

  // Handlers
  const handleUpdateCampaign = () => {
    dispatch(
      updateCampaign({
        campaignId: campaign._id,
        payload: { description: editDescription },
      })
    )
      .unwrap()
      .then(() => {
        refetchCampaign();
        setIsEditingDescription(false);
        setIsEditMode(false);
      })
      .catch((err) => {
        console.error('שגיאה בעדכון קמפיין:', err);
      });
  };

  const handleAddPost = () => {
    if (!newPost.title.trim()) return;

    dispatch(addPost({ campaignId: campaign._id, post: newPost }))
      .unwrap()
      .then(() => {
        refetchCampaign();
        setNewPost({ title: '', content: '', youtubeUrl: '' });
        setIsEditMode(false);
      })
      .catch((err) => {
        console.error('שגיאה בהוספת פוסט:', err);
      });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm('למחוק פוסט זה?')) return;
    
    dispatch(deletePost({ campaignId: campaign._id, postId }))
      .unwrap()
      .then(() => {
        refetchCampaign();
        setIsEditMode(false);
      })
      .catch((err) => {
        console.error('שגיאה במחיקת פוסט:', err);
      });
  };

  // תגובות
  const handleAddComment = async (campaignId, postId, content) => {
    await dispatch(addComment({ campaignId, postId, content })).unwrap();
    refetchCampaign();
  };

  const handleDeleteComment = async (campaignId, postId, commentId) => {
    await dispatch(deleteComment({ campaignId, postId, commentId })).unwrap();
    refetchCampaign();
  };

  // גלריה
const handleUploadGalleryFile = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setUploadingImage(true);
    const url = await uploadImage(file);
    if (!url) return;

    // שמירה בגלריה של הקמפיין
    await dispatch(addImage({ campaignId: campaign._id, imageUrl: url })).unwrap();

    // רענון הקמפיין אחרי הוספה
    refetchCampaign();
    setIsEditMode(false);
  } catch (err) {
    console.error('שגיאה בהעלאת תמונה לגלריה:', err);
    alert('שגיאה בהעלאת הקובץ');
  } finally {
    setUploadingImage(false);
    e.target.value = '';
  }
};


  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    dispatch(addImage({ campaignId: campaign._id, imageUrl: newImageUrl }))
      .unwrap()
      .then(() => {
        refetchCampaign();
        setNewImageUrl('');
        setIsEditMode(false);
      })
      .catch((err) => {
        console.error('שגיאה בהוספת תמונה:', err);
      });
  };

  const handleDeleteImage = (url) => {
    dispatch(deleteImage({ campaignId: campaign._id, imageUrl: url }))
      .unwrap()
      .then(() => {
        refetchCampaign();
        setIsEditMode(false);
      })
      .catch((err) => {
        console.error('שגיאה במחיקת תמונה:', err);
      });
  };

  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: candidate?.name,
          text: `בואו להכיר את ${candidate?.name}`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('הקישור הועתק ללוח!');
    }
  };

  // AI
  const handleAskAiForPost = () => {
    if (!candidateId) return;
    setNewPost({ title: '', content: '', youtubeUrl: '' });
    setAiNote('');
    setAiGenerated(false);
    setShowAiModal(true);
  };

  const handleGenerateWithAi = () => {
    if (!candidateId) return;

    dispatch(
      generatePostSuggestion({
        candidateId,
        titleHint: newPost.title,
        note: aiNote,
      })
    )
      .unwrap()
      .then((suggestion) => {
        const normalized = normalizeAiSuggestion(suggestion, newPost.title);
        setNewPost(normalized);
        setAiGenerated(true);
      })
      .catch((err) => {
        console.error('שגיאה ביצירת פוסט AI:', err);
      });
  };

  const handleCancelAiPost = () => {
    setShowAiModal(false);
    setNewPost({ title: '', content: '', youtubeUrl: '' });
    setAiNote('');
    setAiGenerated(false);
  };

  // === NEW: פונקציות למודאל עריכת מועמד ===
  const handleOpenEditCandidate = () => {
    if (!candidate) return;

    setEditCandForm({
      name: candidate.name || '',
      description: candidate.description || '',
      symbol: candidate.symbol || '',
      photoUrl: candidate.photoUrl || '',
    });
    setEditCandErrors({});
    setUpdateCandidateError('');
    setEditCandidateOpen(true);
  };

  const handleCancelEditCandidate = () => {
    if (updatingThisCandidate) return;
    setEditCandidateOpen(false);
  };

  const handleEditCandChange = (e) => {
    const { name, value } = e.target;
    setEditCandForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadEdit = async (file) => {
    if (!file) return;
    setUploadingEdit(true);
    setUpdateCandidateError('');

    try {
      const url = await uploadImage(file);
      if (!url) throw new Error('לא התקבלה כתובת תמונה');
      setEditCandForm((prev) => ({ ...prev, photoUrl: url }));
    } catch (err) {
      console.error('שגיאה בהעלאת תמונת מועמד:', err);
      setUpdateCandidateError('שגיאה בהעלאת תמונת המועמד/ת');
    } finally {
      setUploadingEdit(false);
    }
  };

  const clearEditPhoto = () => {
    setEditCandForm((prev) => ({ ...prev, photoUrl: '' }));
  };

  const handleSaveEditedCandidate = (e) => {
    e.preventDefault();

    if (!effectiveGroupId || !candidateId) {
      setUpdateCandidateError('חסר מזהה קבוצה או מועמד לעדכון');
      return;
    }

    const { name, description, symbol, photoUrl } = editCandForm;

    // ולידציות בסיסיות לטופס
    const errors = {};
    if (!name?.trim()) errors.name = 'שם מועמד/ת חובה';
    if (!description?.trim()) errors.description = 'תיאור חובה';
    if (!symbol?.trim()) errors.symbol = 'סמל חובה';

    setEditCandErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const patch = {
      name: name.trim(),
      description: (description || '').trim(),
      symbol: (symbol || '').trim(),
      photoUrl: (photoUrl || '').trim(),
    };

    setUpdateCandidateError('');
    setUpdatingThisCandidate(true);

    dispatch(
      updateCandidate({
        candidateId,              // מזהה המועמד מה־URL
        groupId: effectiveGroupId,
        patch,
      })
    )
      .unwrap()
      .then(() => {
        setUpdatingThisCandidate(false);
        setEditCandidateOpen(false);
        refetchCampaign();        // כדי לעדכן שם/סמל/תמונה בקמפיין
      })
      .catch((err) => {
        console.error('שגיאה בעדכון המועמד/ת:', err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'שגיאה בעדכון המועמד/ת';
        setUpdateCandidateError(msg);
        setUpdatingThisCandidate(false);
      });
  };

  return (
    <div className="page-wrap dashboard">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() =>
              navigate(groupId ? `/groups/${groupId}` : '/groups')
            }
            title="חזרה"
          >
            <BiArrowBack size={20} />
          </button>

          {isCandidateOwner && (
            <button
              className="icon-btn"
              onClick={() => setIsEditMode(!isEditMode)}
              title={isEditMode ? 'סיום עריכה' : 'עריכת הדף'}
            >
              {isEditMode ? <FiX size={20} /> : <FiEdit3 size={20} />}
            </button>
          )}
        </div>

        <div className="header-content">
          {candidate?.photoUrl && (
            <img
              src={candidate.photoUrl}
              alt={candidate.name}
              className="candidate-avatar"
            />
          )}

          <h2>{candidate?.name}</h2>
          {candidate?.description && (
            <p className="candidate-description">
              {candidate.description}
            </p>
          )}

          {candidate?.symbol && (
            <span className="candidate-symbol">{candidate.symbol}</span>
          )}

          {isCandidateOwner && isEditMode && (
            <button
              type="button"
              className="vote-btn edit-candidate-btn"
              onClick={handleOpenEditCandidate}
            >
              עריכת מועמד/ת
            </button>
          )}
        </div>
      </div>

      <div className="main-content-resizable">
        {/* LEFT: POSTS */}
        <div className="left-section" style={{ width: '35%' }}>
          <div className="candidates-container">
            <h3 className="section-title">פוסטים</h3>

            {isCandidateOwner && isEditMode && (
              <div className="info-card">
                <input
                  type="text"
                  placeholder="כותרת פוסט"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                />
                <textarea
                  placeholder="תוכן הפוסט"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="קישור YouTube (אופציונלי)"
                  value={newPost.youtubeUrl}
                  onChange={(e) =>
                    setNewPost({ ...newPost, youtubeUrl: e.target.value })
                  }
                />

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <button className="vote-btn" onClick={handleAddPost}>
                    הוסף פוסט
                  </button>

                  <button
                    type="button"
                    className="vote-btn"
                    onClick={handleAskAiForPost}
                  >
                    עזרה מ־AI
                  </button>
                </div>
              </div>
            )}

            <div className="posts-list">
              {campaign.posts?.length ? (
                campaign.posts.map((p) => (
                  <PostCard
                    key={p._id}
                    post={p}
                    campaignId={campaign._id}
                    currentUserId={currentUserId}
                    isCandidateOwner={isCandidateOwner}
                    isEditMode={isEditMode}
                    onDeletePost={handleDeletePost}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                  />
                ))
              ) : (
                <div className="empty-state">אין פוסטים בקמפיין</div>
              )}
            </div>
          </div>
        </div>

        {/* RESIZE HANDLE */}
        <div className="resize-handle">
          <div className="resize-line" />
        </div>

        {/* RIGHT: DESCRIPTION + GALLERY */}
        <div className="right-section" style={{ width: '65%' }}>
          <h3 className="section-title">אודות</h3>

          <div className="info-card">
            {isEditingDescription ? (
              <div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="הוסף תיאור לקמפיין"
                />
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '10px',
                  }}
                >
                  <button className="vote-btn" onClick={handleUpdateCampaign}>
                    שמור
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      setIsEditingDescription(false);
                      setIsEditMode(false);
                    }}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>{editDescription || 'אין תיאור קמפיין עדיין'}</p>
                {isCandidateOwner && isEditMode && (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="vote-btn"
                  >
                    ערוך תיאור
                  </button>
                )}
              </div>
            )}
          </div>

          {/* סטטיסטיקות */}
          <div className="stats-cards">
            <div className="stat-box">
              <FiEye size={20} />
              <span>{viewCount} צפיות</span>
            </div>

    <div className="stat-box clickable">
<button className="icon-btn" onClick={handleToggleLike}>
  <FiHeart
    size={24}
    color={hasLiked ? 'red' : 'gray'}
    style={{ fill: hasLiked ? 'red' : 'none' }}
  />
  <span>{likeCount}</span>
</button>

</div>




            <div className="stat-box clickable" onClick={handleShare}>
              <FiShare2 size={20} />
              <span>שתף</span>
            </div>
          </div>

          <h3 className="section-title">גלריית תמונות</h3>

          {isCandidateOwner && isEditMode && (
            <div className="info-card">
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                <input
                  type="text"
                  placeholder="קישור לתמונה"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  className="vote-btn"
                  onClick={handleAddImage}
                  disabled={!newImageUrl.trim()}
                >
                  הוסף
                </button>
              </div>

              <div className="upload-row">
                <span className="muted">או העלאה מהמחשב:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadGalleryFile}
                  disabled={uploadingImage}
                />
                {uploadingImage && <div className="loading-spinner" />}
              </div>
            </div>
          )}

          <div className="gallery-container">
            <div className="gallery-grid">
           {campaign.gallery?.length ? (
  campaign.gallery.map((img, idx) => (
    <div key={idx} className="gallery-item" onClick={() => setSelectedImage(img)}>
      <img
        src={img || '/q.jpg'}
        alt={`תמונה ${idx + 1}`}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = '/q.png';
        }}
      />
      {isCandidateOwner && isEditMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteImage(img);
          }}
        >
          ×
        </button>
      )}
    </div>
  ))
) : (
  <div className="empty-state">אין תמונות בגלריה</div>
)}

            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="תמונה מוגדלת"
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-close"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </div>
      )}

{/* <<<<<<< HEAD */}
{/* // ======= */}
      {/* מודאל עריכת מועמד/ת */}
      <EditCandidateModal
        open={editCandidateOpen}
        editCandForm={editCandForm}
        editCandErrors={editCandErrors}
        updatingThisCandidate={updatingThisCandidate}
        updateCandidateError={updateCandidateError}
        onEditCandChange={handleEditCandChange}
        onSaveEditedCandidate={handleSaveEditedCandidate}
        onCancelEditCandidate={handleCancelEditCandidate}
        uploadingEdit={uploadingEdit}
        onUploadEdit={handleUploadEdit}
        editFileInputRef={editFileInputRef}
        clearEditPhoto={clearEditPhoto}
        canEditName={false}
      />


      {/* מודאל AI לפוסט קמפיין */}
{/* >>>>>>> f626efaa96775a3bd42eed6f5e1db18dfb2f900a */}
      {showAiModal && (
        <div
          className="lightbox-overlay ai-overlay"
          onClick={handleCancelAiPost}
        >
          <div
            className="info-card ai-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ai-modal-header">
              <span className="ai-modal-icon">✨</span>
              <h3>עזרה בכתיבת פוסט (AI)</h3>
            </div>

            <p className="ai-modal-subtitle">
              המערכת תשתמש בשם המועמד/ת והקבוצה ותיצור פוסט קצר בגוף ראשון
            </p>

            <div className="ai-field-group">
              <label className="ai-label">
                {aiGenerated
                  ? 'כותרת הפוסט:'
                  : 'כותרת מוצעת:'}
              </label>
              <input
                type="text"
                className="ai-input"
                placeholder={`כותרת לפוסט עבור ${candidate?.name || 'המועמד/ת'}`}
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
              />
            </div>

            <div className="ai-field-group">
              <label className="ai-label">
                {aiGenerated ? 'תוכן:' : 'על מה לכתוב?'}
              </label>
              <textarea
                className="ai-textarea"
                rows={5}
                placeholder="לדוגמה: להתמקד בשקיפות, בעזרה לחברים בקבוצה..."
                value={aiGenerated ? newPost.content : aiNote}
                onChange={(e) => {
                  if (aiGenerated) {
                    setNewPost({ ...newPost, content: e.target.value });
                  } else {
                    setAiNote(e.target.value);
                  }
                }}
              />
            </div>

            {!aiGenerated && (
              <button
                className="vote-btn ai-generate-btn"
                type="button"
                onClick={handleGenerateWithAi}
                disabled={aiLoading}
              >
                {aiLoading ? 'מייצר פוסט…' : 'יצירת פוסט עם AI'}
              </button>
            )}

            {aiError && <div className="err ai-error">{aiError}</div>}

            {aiGenerated && (
              <div className="ai-actions-row">
                <button
                  className="cg-btn-outline"
                  type="button"
                  onClick={handleCancelAiPost}
                >
                  ביטול
                </button>
                <button
                  className="cg-btn"
                  type="button"
                  onClick={() => {
                    handleAddPost();
                    setShowAiModal(false);
                    setAiGenerated(false);
                  }}
                  disabled={!newPost.title.trim()}
                >
                  שמור פוסט
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}