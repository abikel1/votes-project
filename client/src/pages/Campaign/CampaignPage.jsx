import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCampaign, selectCampaign, selectCampaignLoading, selectCampaignError } from '../../slices/campaignSlice';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CampaignPage() {
  const { candidateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.state?.groupId || null; // ← מקבלת את ה-ID שהעברנו

  const campaign = useSelector(selectCampaign);
  const loading = useSelector(selectCampaignLoading);
  const error = useSelector(selectCampaignError);

  useEffect(() => {
    dispatch(fetchCampaign(candidateId));
  }, [candidateId, dispatch]);

  if (loading) return <div>טוען קמפיין…</div>;
  if (error) return <div>שגיאה: {error}</div>;
  if (!campaign) return <div>אין קמפיין למועמד</div>;

  return (




    <div className="campaign-page">

      <button
        onClick={() => {
          if (groupId) {
            navigate(`/groups/${groupId}`);
          } else {
            navigate('/groups');
          }
        }}
        className="back-btn"
      >
        חזרה לקבוצה
      </button>

<div className="candidate-info">
  <h1>{campaign.candidate?.name}</h1>

  {campaign.candidate?.photoUrl && (
    <img 
      src={campaign.candidate.photoUrl} 
      alt={campaign.candidate.name} 
      className="candidate-photo"
    />
  )}

  {campaign.candidate?.symbol && (
    <div className="candidate-symbol">
      {campaign.candidate.symbol}
    </div>
  )}

  {campaign.candidate?.description && (
    <p>{campaign.candidate.description}</p>
  )}
</div>



      <h2>{campaign.title}</h2>
      <p>{campaign.description}</p>

      <h3>פוסטים</h3>
      {campaign.posts?.length ? (
        campaign.posts.map((p) => (
          <div key={p._id} className="campaign-post">
            <h4>{p.title}</h4>
            <p>{p.content}</p>
          </div>
        ))
      ) : (
        <p>אין פוסטים בקמפיין.</p>
      )}
    </div>
  );
}
