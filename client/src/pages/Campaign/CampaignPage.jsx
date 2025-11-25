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

import '../Campaign/CampaignPage.css';
import '../GroupDetail/GroupDetailPage.css';
import { BiArrowBack } from 'react-icons/bi';

export default function CampaignPage() {
  const { candidateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const groupId = location.state?.groupId || null;

  // --- Redux State ---
  const campaign = useSelector((state) => state.campaign.data);
  const campaignLoading = useSelector((state) => state.campaign.loading);
  const campaignError = useSelector((state) => state.campaign.error);

  const currentUserId = useSelector((state) => state.auth.userId);
  const userLoading = useSelector((state) => state.auth.loading);

  // --- Local State ---
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  //---------------------------------------------------------------------
  // 1) נטען משתמש → ואז קמפיין → ואז מציגים הכול
  //---------------------------------------------------------------------

  // טוען קמפיין רק כאשר גם userId וגם candidateId זמינים
  useEffect(() => {
    if (!userLoading && currentUserId && candidateId) {
      dispatch(fetchCampaign(candidateId));
    }
  }, [currentUserId, userLoading, candidateId, dispatch]);

  // מעדכן תיאור כשקמפיין נטען
  useEffect(() => {
    if (campaign?.description) {
      setEditDescription(campaign.description);
    }
  }, [campaign]);

  //---------------------------------------------------------------------
  // 2) טעינה וסינון
  //---------------------------------------------------------------------

  if (userLoading) return <div>טוען משתמש…</div>;
  if (campaignLoading || !campaign) return <div>טוען קמפיין…</div>;
  if (campaignError) return <div className="err">שגיאה: {campaignError}</div>;

  //---------------------------------------------------------------------
  // 3) לוגיקת בעלות
  //---------------------------------------------------------------------

  const candidateUserId =
    campaign?.candidate?.userId ||
    campaign?.candidate?._id ||
    campaign?.candidate;

  const isCandidateOwner =
    currentUserId &&
    candidateUserId &&
    currentUserId.toString() === candidateUserId.toString();

  //---------------------------------------------------------------------
  // 4) פעולות
  //---------------------------------------------------------------------

  const handleUpdateCampaign = () => {
    dispatch(updateCampaign({ campaignId: campaign._id, payload: { description: editDescription } }));
    setIsEditingDescription(false);
  };

  const handleAddPost = () => {
    if (!newPost.title.trim()) return;
    dispatch(addPost({ campaignId: campaign._id, post: newPost }));
    setNewPost({ title: '', content: '' });
  };

  const handleDeletePost = (postId) => {
    dispatch(deletePost({ campaignId: campaign._id, postId }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    dispatch(addImage({ campaignId: campaign._id, imageUrl: newImageUrl }));
    setNewImageUrl('');
  };

  const handleDeleteImage = (url) => {
    dispatch(deleteImage({ campaignId: campaign._id, imageUrl: url }));
  };

  //---------------------------------------------------------------------
  // 5) Render
  //---------------------------------------------------------------------

  return (
    <div className="page-wrap dashboard">

      {/* כפתור חזרה */}
      <div className="page-header">
        <div className="header-title">
          <h2>{campaign.candidate?.name}</h2>
          {campaign.candidate?.symbol && <p>{campaign.candidate.symbol}</p>}
        </div>

        {campaign.candidate?.photoUrl && (
          <img
            src={campaign.candidate.photoUrl}
            alt={campaign.candidate.name}
            className="candidate-avatar"
          />
        )}

        <button
          className="icon-btn"
          onClick={() => navigate(groupId ? `/groups/${groupId}` : '/groups')}
        >
          <BiArrowBack size={20} />
        </button>
      </div>

      <div className="main-content-resizable">

        {/* --- צד שמאל - פוסטים --- */}
        <div className="left-section">
          <div className="candidates-container">
            <h3 className="section-title">פוסטים</h3>

            {/* הוספת פוסט */}
            {isCandidateOwner && (
              <div className="info-card" style={{ marginBottom: '16px', padding: '16px' }}>
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

                <button onClick={handleAddPost} className="vote-btn">
                  הוסף פוסט
                </button>
              </div>
            )}

            {/* רשימת פוסטים */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: '8px',
              }}
            >
              {campaign.posts?.length ? (
                campaign.posts.map((p) => (
                  <div key={p._id} className="candidate-card">
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '700' }}>
                      {p.title}
                    </h4>

                    <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '13px' }}>
                      {p.content}
                    </p>

                    {isCandidateOwner && (
                      <button
                        onClick={() => handleDeletePost(p._id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        מחק
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                  אין פוסטים בקמפיין.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* פס גרירה */}
        <div className="resize-handle">
          <div className="resize-line" />
        </div>

        {/* --- צד ימין - גלריה --- */}
        <div className="right-section">
          <div className="info-card" style={{ marginBottom: '20px' }}>
            {/* תיאור */}
            <div style={{ marginTop: '16px' }}>
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      marginBottom: '8px',
                      padding: '10px',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={handleUpdateCampaign} className="vote-btn">
                      שמור
                    </button>

                    <button
                      onClick={() => setIsEditingDescription(false)}
                      className="back-btn"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    {editDescription || 'אין תיאור קמפיין עדיין'}
                  </p>

                  {isCandidateOwner && (
                    <button onClick={() => setIsEditingDescription(true)}>
                      ערוך תיאור
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <h3 className="section-title">גלריית תמונות</h3>

          {isCandidateOwner && (
            <div className="info-card" style={{ marginBottom: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="קישור תמונה"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  style={{ flex: 1 }}
                />

                <button onClick={handleAddImage} className="vote-btn">
                  הוסף תמונה
                </button>
              </div>
            </div>
          )}

          {/* גלריה */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              padding: '16px',
              overflowY: 'auto',
              maxHeight: '400px',
            }}
          >
            {campaign.gallery?.length ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px',
                }}
              >
                {campaign.gallery
                  .filter((url) => url && url.startsWith('http'))
                  .map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {isCandidateOwner && (
                        <button
                          onClick={() => handleDeleteImage(img)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b' }}>
                אין תמונות בגלריה.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
