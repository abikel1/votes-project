import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, updateProfile } from '../../slices/authSlice'; // thunk עדכון פרופיל
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
const [userGroups, setUserGroups] = useState({ created: [], joined: [] });
const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

useEffect(() => {
  if (!user && token) {
    dispatch(fetchProfile());
  } else if (user) {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  }
}, [user, token, dispatch]);


  useEffect(() => {
  if (user && token) {
    fetch('/api/groups/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUserGroups(data))
      .catch(err => console.error('Error fetching user groups:', err));
  }
}, [user, token]);

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
   <div className="profile-avatar">
  {user.firstName ? user.firstName[0].toUpperCase() : 'מ'}
</div>

<div className="profile-details">
  {editMode ? (
    <>
      <p>
        <strong>שם פרטי:</strong>{' '}
        <input name="firstName" value={formData.firstName} onChange={handleChange} />
      </p>
      <p>
        <strong>שם משפחה:</strong>{' '}
        <input name="lastName" value={formData.lastName} onChange={handleChange} />
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
      <p><strong>שם פרטי:</strong> {user.firstName}</p>
      <p><strong>שם משפחה:</strong> {user.lastName}</p>
      <p><strong>אימייל:</strong> {user.email}</p>
      <p><strong>טלפון:</strong> {user.phone}</p>
      <p><strong>כתובת:</strong> {user.address}</p>
      <button className="edit-btn" onClick={() => setEditMode(true)}>עריכת משתמש</button>
    </>
  )}
</div>

      </div>

  
<div className="profile-groups">
  <h2>קבוצות שאני מנהלת</h2>
  <ul>
    {userGroups.created.length > 0 
      ? userGroups.created.map(g => (
          <li key={g._id} className="group-item">
            <span>{g.name}</span>
            <button onClick={() => navigate(`/groups/${g._id}`)}>לפרטי הקבוצה</button>
          </li>
        ))
      : <li>אין קבוצות</li>}
  </ul>

  <h2>קבוצות שאני משתתפת בהן</h2>
  <ul>
    {userGroups.joined.length > 0 
      ? userGroups.joined.map(g => (
          <li key={g._id} className="group-item">
            <span>{g.name}</span>
            <button onClick={() => navigate(`/groups/${g._id}`)}>לפרטי הקבוצה</button>
          </li>
        ))
      : <li>אין קבוצות</li>}
  </ul>
</div>

    </div>
  );
}
