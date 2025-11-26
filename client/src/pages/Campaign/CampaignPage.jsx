import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCampaign,
  addPost,
  deletePost,
  addImage,
  deleteImage,
  updateCampaign,
} from '../../slices/campaignSlice';
import { BiArrowBack } from 'react-icons/bi';

import '../Campaign/CampaignPage.css';
import '../GroupDetail/GroupDetailPage.css';
import { selectCampaign,selectCandidate } from '../../slices/campaignSlice';

export default function CampaignPage() {
  const { candidateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.state?.groupId || null;

  // --- Redux state ---
const campaign = useSelector(selectCampaign); // עכשיו זה הקמפיין עצמו
const candidate = useSelector(selectCandidate); // עכשיו זה המועמד עצמו

  const campaignLoading = useSelector((state) => state.campaign.loading);
  const campaignError = useSelector((state) => state.campaign.error);
  const currentUserId = useSelector((state) => state.auth.userId);
  const userLoading = useSelector((state) => state.auth.loading);

  // --- Local state ---
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  //---------------------------------------------------------------------
  // 1) Load campaign
  //---------------------------------------------------------------------
  useEffect(() => {
    if (candidateId) {
      console.log('Fetching campaign for candidateId:', candidateId);
      dispatch(fetchCampaign(candidateId));
    }
  }, [candidateId, dispatch]);

  useEffect(() => {
    if (campaign) {
      console.log('Campaign loaded:', campaign);
      if (campaign.description) setEditDescription(campaign.description);
    }
  }, [campaign]);

  //---------------------------------------------------------------------
  // 2) Loading / Error
  //---------------------------------------------------------------------
  if (userLoading) return <div>טוען משתמש…</div>;
  if (campaignLoading || !campaign) return <div>טוען קמפיין…</div>;
  if (campaignError) return <div className="err">שגיאה: {campaignError}</div>;

  //---------------------------------------------------------------------
  // 3) Ownership logic
  //---------------------------------------------------------------------
  const candidateUserId = candidate?.userId;
  const isCandidateOwner =
    currentUserId && candidateUserId && currentUserId.toString() === candidateUserId.toString();

  //---------------------------------------------------------------------
  // 4) Handlers
  //---------------------------------------------------------------------
  const handleUpdateCampaign = () => {
    console.log('Updating campaign description:', editDescription);
    dispatch(updateCampaign({ campaignId: campaign._id, payload: { description: editDescription } }));
    setIsEditingDescription(false);
    setIsEditMode(false);
  };

const handleAddPost = () => {
  if (!newPost.title.trim()) return;
  dispatch(addPost({ campaignId: campaign._id, post: newPost }));
  setNewPost({ title: '', content: '' });
};


  const handleDeletePost = (postId) => {
    console.log('Deleting postId:', postId);
    dispatch(deletePost({ campaignId: campaign._id, postId }));
    setIsEditMode(false);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    console.log('Adding image URL:', newImageUrl);
    dispatch(addImage({ campaignId: campaign._id, imageUrl: newImageUrl }));
    setNewImageUrl('');
    setIsEditMode(false);
  };

  const handleDeleteImage = (url) => {
    console.log('Deleting image URL:', url);
    dispatch(deleteImage({ campaignId: campaign._id, imageUrl: url }));
    setIsEditMode(false);
  };

  //---------------------------------------------------------------------
  // 5) Render
  //---------------------------------------------------------------------
  console.log('Rendering CampaignPage. Campaign gallery:', campaign.gallery);
console.log('Campaign gallery:', campaign?.gallery);

  return (
    <div className="page-wrap dashboard">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-title">
          <h2>{candidate?.name}</h2>
          {candidate?.symbol && <p>{candidate.symbol}</p>}
        </div>

        {candidate?.photoUrl && <img src={candidate.photoUrl} alt={candidate.name} className="candidate-avatar" />}

        <button className="icon-btn" onClick={() => navigate(groupId ? `/groups/${groupId}` : '/groups')}>
          <BiArrowBack size={20} />
        </button>

        {isCandidateOwner && !isEditMode && (
          <button className="vote-btn" onClick={() => setIsEditMode(true)} style={{ marginRight: '10px' }}>
            עריכת הדף
          </button>
        )}
      </div>

      <div className="main-content-resizable">
        {/* LEFT: POSTS */}
        <div className="left-section">
          <h3 className="section-title">פוסטים</h3>

          {isCandidateOwner && isEditMode && (
            <div className="info-card">
              <input
                type="text"
                placeholder="כותרת פוסט"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <textarea
                placeholder="תוכן פוסט"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
              <button className="vote-btn" onClick={handleAddPost}>הוסף פוסט</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {campaign.posts?.length ? (
              campaign.posts.map((p) => (
                <div key={p._id} className="candidate-card">
                  <h4>{p.title}</h4>
                  <p>{p.content}</p>
                  {isCandidateOwner && isEditMode && (
                    <button onClick={() => handleDeletePost(p._id)} className="delete-btn">מחיקה</button>
                  )}
                </div>
              ))
            ) : <p style={{ textAlign: 'center', color: '#64748b' }}>אין פוסטים בקמפיין.</p>}
          </div>
        </div>

        {/* RESIZE HANDLE */}
        <div className="resize-handle"><div className="resize-line" /></div>

        {/* RIGHT: DESCRIPTION + GALLERY */}
        <div className="right-section">
          <div className="info-card">
            {isEditingDescription ? (
              <div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button className="vote-btn" onClick={handleUpdateCampaign}>שמור</button>
                  <button className="back-btn" onClick={() => { setIsEditingDescription(false); setIsEditMode(false); }}>ביטול</button>
                </div>
              </div>
            ) : (
              <div>
                <p>{editDescription || 'אין תיאור קמפיין עדיין'}</p>
                {isCandidateOwner && isEditMode && (
                  <button onClick={() => setIsEditingDescription(true)}>ערוך תיאור</button>
                )}
              </div>
            )}
          </div>

          <h3 className="section-title">גלריית תמונות</h3>
          {isCandidateOwner && isEditMode && (
            <div className="info-card" style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="קישור תמונה"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <button className="vote-btn" onClick={handleAddImage}>הוסף תמונה</button>
            </div>
          )}

          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {campaign.gallery?.length ? (
              campaign.gallery.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isCandidateOwner && isEditMode && (
                    <button onClick={() => handleDeleteImage(img)} className="delete-btn">×</button>
                  )}
                </div>
              ))
            ) : <p style={{ textAlign: 'center', color: '#64748b' }}>אין תמונות בגלריה.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
