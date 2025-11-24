// src/pages/Campaign/CampaignPage.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import http from '../../api/http';

export default function CampaignPage() {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const { data } = await http.get(`/candidates/${candidateId}`);
        setCandidate(data);
      } catch (err) {
        console.error('Failed to fetch candidate', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [candidateId]);

  if (loading) return <div>טוען מועמד…</div>;
  if (!candidate) return <div>מועמד לא נמצא</div>;

  return (
    <div className="campaign-page">
      <h2>קמפיין של {candidate.name}</h2>
      <p>{candidate.description}</p>

      {/* כאן בעתיד תוסיף עורך טקסט, העלאת תמונות/סרטונים, פרסום פוסטים, פגישות וכו' */}
    </div>
  );
}
