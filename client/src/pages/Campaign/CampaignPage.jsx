import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCampaign, selectCampaign, selectCampaignLoading, selectCampaignError } from '../../slices/campaignSlice';

export default function CampaignPage() {
  const { candidateId } = useParams();
  const dispatch = useDispatch();

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
