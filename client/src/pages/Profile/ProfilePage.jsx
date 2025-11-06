import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../../slices/authSlice'; // thunk שמביא את פרטי המשתמש
import './ProfilePage.css';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  // אם אין משתמש ב-store אבל יש טוקן, משוך את הפרופיל מהשרת
  useEffect(() => {
    if (!user && token) {
      dispatch(fetchProfile());
    }
  }, [user, token, dispatch]);

  if (loading || !user) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>טוען פרופיל...</p>;
  }

  const allGroups = (user.createdGroups || []).concat(user.joinedGroups || []);

  return (
    <div className="profile-container">
      <h1>הפרופיל שלי</h1>

      <div className="profile-top">
        {/* צד שמאל - ריבוע פרופיל */}
        <div className="profile-avatar">
          {user.name ? user.name[0].toUpperCase() : 'מ'}
        </div>

        {/* צד ימין - פרטים אישיים */}
        <div className="profile-details">
          <p><strong>שם:</strong> {user.name}</p>
          <p><strong>אימייל:</strong> {user.email}</p>
          <p><strong>טלפון:</strong> {user.phone}</p>
          <p><strong>כתובת:</strong> {user.address}</p>
        </div>
      </div>

      {/* קבוצות */}
      <div className="profile-groups">
        <h2>קבוצות שאני מנהלת / הצבעתי בהן</h2>
        <ul>
          {allGroups.length > 0
            ? allGroups.map((g, idx) => <li key={idx}>{g}</li>)
            : <li>אין קבוצות להצגה</li>}
        </ul>
      </div>
    </div>
  );
}
