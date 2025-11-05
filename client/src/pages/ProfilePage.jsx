import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../slices/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(s => s.auth);

  useEffect(() => { dispatch(fetchMe()); }, [dispatch]);

  if (loading && !user) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!user) return null;

  return (
    <div>
      <h3>הפרופיל שלי</h3>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
