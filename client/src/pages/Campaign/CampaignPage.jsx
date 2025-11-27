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
} from '../../slices/campaignSlice';

import { BiArrowBack } from 'react-icons/bi';
import {
  FiEdit3,
  FiEye,
  FiHeart,
  FiShare2,
  FiX,          // 👈 הוספנו את FiX
} from 'react-icons/fi';

import './CampaignPage.css';
import { uploadImage } from '../../components/GroupSettings/uploadImage';

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

  // Local state
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // כדי לא להעלות צפייה פעמיים ב-StrictMode
  const hasIncrementedViewRef = useRef(false);

  // טוענים קמפיין לפי candidateId
  useEffect(() => {
    if (candidateId) {
      dispatch(fetchCampaign(candidateId));
      // כשנכנסים לקמפיין חדש – מאפסים את הדגל
      hasIncrementedViewRef.current = false;
    }
  }, [candidateId, dispatch]);

  // אחרי שהקמפיין נטען ויש לו _id – מעלים צפייה פעם אחת למאונט הזה
  useEffect(() => {
    if (campaign?._id && !hasIncrementedViewRef.current) {
      hasIncrementedViewRef.current = true;
      dispatch(incrementView(campaign._id));
    }
  }, [campaign?._id, dispatch]);

  // מעדכנים state מקומי כשקמפיין משתנה
  useEffect(() => {
    if (campaign) {
      if (campaign.description) setEditDescription(campaign.description);
      if (campaign.likeCount) setLikeCount(campaign.likeCount);
    }
  }, [campaign]);

  // Loading / Error
  if (userLoading) return <div className="loading-wrap">טוען משתמש…</div>;
  if (campaignLoading || !campaign)
    return <div className="loading-wrap">טוען קמפיין…</div>;
  if (campaignError) return <div className="err">שגיאה: {campaignError}</div>;

  // Ownership logic
  const candidateUserId = candidate?.userId;
  const isCandidateOwner =
    currentUserId &&
    candidateUserId &&
    currentUserId.toString() === candidateUserId.toString();

  // צפיות מהשרת
  const viewCount = campaign.viewCount || 0;

  // Handlers
  const handleUpdateCampaign = () => {
    dispatch(
      updateCampaign({
        campaignId: campaign._id,
        payload: { description: editDescription },
      })
    );
    setIsEditingDescription(false);
    setIsEditMode(false);
  };

  const handleAddPost = () => {
    if (!newPost.title.trim()) return;

    dispatch(addPost({ campaignId: campaign._id, post: newPost }))
      .unwrap()
      .then(() => {
        setNewPost({ title: '', content: '' });
        setIsEditMode(false);
      })
      .catch(() => { });
  };

  const handleDeletePost = (postId) => {
    dispatch(deletePost({ campaignId: campaign._id, postId }));
    setIsEditMode(false);
  };

  const handleUploadGalleryFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadImage(file);
      if (!url) return;
      await dispatch(addImage({ campaignId: campaign._id, imageUrl: url }));
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
    dispatch(addImage({ campaignId: campaign._id, imageUrl: newImageUrl }));
    setNewImageUrl('');
    setIsEditMode(false);
  };

  const handleDeleteImage = (url) => {
    dispatch(deleteImage({ campaignId: campaign._id, imageUrl: url }));
    setIsEditMode(false);
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

          {candidate?.symbol && (
            <span className="candidate-symbol">{candidate.symbol}</span>
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
                <button className="vote-btn" onClick={handleAddPost}>
                  הוסף פוסט
                </button>
              </div>
            )}

            <div className="posts-list">
              {campaign.posts?.length ? (
                campaign.posts.map((p) => (
                  <div key={p._id} className="candidate-card">
                    <h4>{p.title}</h4>
                    <p>{p.content}</p>
                    {isCandidateOwner && isEditMode && (
                      <button
                        onClick={() => handleDeletePost(p._id)}
                        className="delete-btn"
                      >
                        מחיקה
                      </button>
                    )}
                  </div>
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

            <div className="stat-box clickable" onClick={handleLike}>
              <FiHeart size={22} color={hasLiked ? 'red' : 'inherit'} />
              <span>{likeCount} אהבו</span>
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
                  <div
                    key={idx}
                    className="gallery-item"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`תמונה ${idx + 1}`} />
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

      {/* Lightbox לתמונות */}
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
    </div>
  );
}
