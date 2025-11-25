import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
fetchCampaign,
selectCampaign,
selectCampaignLoading,
selectCampaignError,
addPost,
deletePost,
addImage,
deleteImage,
updateCampaign,
} from '../../slices/campaignSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Campaign/CampaignPage.css';

export default function CampaignPage() {
const { candidateId } = useParams();
const dispatch = useDispatch();
const navigate = useNavigate();
const location = useLocation();
const groupId = location.state?.groupId || null;

const campaign = useSelector(selectCampaign);
const loading = useSelector(selectCampaignLoading);
const error = useSelector(selectCampaignError);

const [newPost, setNewPost] = useState({ title: '', content: '' });
const [newImageUrl, setNewImageUrl] = useState('');
const [editDescription, setEditDescription] = useState('');

useEffect(() => {
dispatch(fetchCampaign(candidateId));
}, [candidateId, dispatch]);

useEffect(() => {
if (campaign?.description) setEditDescription(campaign.description);
}, [campaign]);

const handleUpdateCampaign = () => {
dispatch(updateCampaign({ campaignId: campaign._id, payload: { description: editDescription } }));
};

const handleAddPost = () => {
if (!newPost.title) return;
dispatch(addPost({ campaignId: campaign._id, post: newPost }));
setNewPost({ title: '', content: '' });
};

const handleDeletePost = (postId) => {
  console.log("Deleting postId:", postId, "campaignId:", campaign._id);
  dispatch(deletePost({ campaignId: campaign._id, postId }));
};


const handleAddImage = () => {
if (!newImageUrl) return;
dispatch(addImage({ campaignId: campaign._id, imageUrl: newImageUrl }));
setNewImageUrl('');
};

const handleDeleteImage = (url) => {
  // אם backend לא תומך בשדות מספריים, צריך להמיר את המפתח או להשתמש ב־API חדש
  dispatch(deleteImage({ campaignId: campaign._id, imageUrl: url }));
};


// const images = useMemo(() => {
//   return campaign
//     ? Object.keys(campaign)
//         .filter((key) => !isNaN(key))
//         .map((key) => campaign[key])
//     : [];
// }, [campaign]);


if (loading) return <div>טוען קמפיין…</div>;
if (error) return <div>שגיאה: {error}</div>;
if (!campaign) return <div>אין קמפיין למועמד</div>;

return ( <div className="campaign-page">
<button
onClick={() => navigate(groupId ? `/groups/${groupId}` : '/groups')}
className="back-btn"
>
חזרה לקבוצה </button>

```
  <div className="candidate-info">
    <h1>{campaign.candidate?.name}</h1>
    {campaign.candidate?.photoUrl && (
      <img src={campaign.candidate.photoUrl} alt={campaign.candidate.name} className="candidate-photo" />
    )}
    {campaign.candidate?.symbol && <div className="candidate-symbol">{campaign.candidate.symbol}</div>}
    {campaign.candidate?.description && <p>{campaign.candidate.description}</p>}
  </div>

  <h2>תיאור הקמפיין</h2>
  <textarea
    value={editDescription}
    onChange={(e) => setEditDescription(e.target.value)}
  />
  <button onClick={handleUpdateCampaign}>עדכן תיאור קמפיין</button>

  <h3>פוסטים</h3>
  {campaign.posts?.length ? (
    campaign.posts.map((p) => (
      <div key={p._id} className="campaign-post">
        <h4>{p.title}</h4>
        <p>{p.content}</p>
        <button onClick={() => handleDeletePost(p._id)}>מחיקה</button>
      </div>
    ))
  ) : (
    <p>אין פוסטים בקמפיין.</p>
  )}
  <div className="new-post">
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
    <button onClick={handleAddPost}>הוסף פוסט</button>
  </div>

  <h3>גלריית תמונות</h3>
{campaign.gallery?.filter(url => url && url.startsWith('http')).length ? (
  <div className="campaign-gallery">
    {campaign.gallery
      .filter(url => url && url.startsWith('http'))
      .map((img, idx) => (
        <div key={idx} className="gallery-item">
          <img src={img} alt={`Gallery ${idx}`} />
          <button onClick={() => handleDeleteImage(img)}>מחק</button>
        </div>
      ))}
  </div>
) : (
  <p>אין תמונות בגלריה.</p>
)}


  <div className="new-image">
    <input
      type="text"
      placeholder="קישור תמונה"
      value={newImageUrl}
      onChange={(e) => setNewImageUrl(e.target.value)}
    />
    <button onClick={handleAddImage}>הוסף תמונה</button>
  </div>
</div>


);
}
