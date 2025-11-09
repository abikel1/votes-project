import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, updateProfile } from '../../slices/authSlice'; // thunk עדכון פרופיל
import './ProfilePage.css';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    if (!user && token) {
      dispatch(fetchProfile());
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, token, dispatch]);

  if (loading || !user) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>טוען פרופיל...</p>;
  }

  const allGroups = (user.createdGroups || []).concat(user.joinedGroups || []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    dispatch(updateProfile(formData));
    setEditMode(false);
  };

  return (
    <div className="profile-container">
      <h1>הפרופיל שלי</h1>

      <div className="profile-top">
        <div className="profile-avatar">{user.name ? user.name[0].toUpperCase() : 'מ'}</div>

        <div className="profile-details">
          {editMode ? (
            <>
              <p>
                <strong>שם:</strong>{' '}
                <input name="name" value={formData.name} onChange={handleChange} />
              </p>
              <p>
                <strong>אימייל:</strong>{' '}
                <input name="email" value={formData.email} onChange={handleChange} />
              </p>
              <p>
                <strong>טלפון:</strong>{' '}
                <input name="phone" value={formData.phone} onChange={handleChange} />
              </p>
              <p>
                <strong>כתובת:</strong>{' '}
                <input name="address" value={formData.address} onChange={handleChange} />
              </p>
              <button className="edit-btn save" onClick={handleSave}>שמור</button>
              <button className="edit-btn cancel" onClick={() => setEditMode(false)}>ביטול</button>
            </>
          ) : (
            <>
              <p><strong>שם:</strong> {user.name}</p>
              <p><strong>אימייל:</strong> {user.email}</p>
              <p><strong>טלפון:</strong> {user.phone}</p>
              <p><strong>כתובת:</strong> {user.address}</p>
              <button className="edit-btn" onClick={() => setEditMode(true)}>עריכת משתמש</button>
            </>
          )}
        </div>
      </div>

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
