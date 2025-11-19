import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, updateProfile, changePassword, clearError, clearMessage } from '../../slices/authSlice';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import CityStreetAuto from '../../components/CityStreetAuto';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const updateErrors = useSelector((state) => state.auth.updateErrors); // שגיאות עדכון מה־slice
  const message = useSelector((state) => state.auth.message);           // הודעת הצלחה כללית
  const [userGroups, setUserGroups] = useState({ created: [], joined: [] });
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: ''
  });

  // 🔐 שינוי סיסמה – סטייטים
  const [editPasswordMode, setEditPasswordMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwErrors, setPwErrors] = useState({}); // שגיאות מקומיות: current/new/confirm

  useEffect(() => {
    if (!user && token) {
      dispatch(fetchProfile());
    } else if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
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

  // 💡 ולידציה "חיה" לאימות סיסמה – בדיוק כמו בהרשמה
  useEffect(() => {
    setPwErrors((prev) => ({
      ...prev,
      confirm:
        confirm && newPassword && confirm !== newPassword
          ? 'הסיסמאות אינן תואמות'
          : undefined,
    }));
  }, [newPassword, confirm]);

  // כשפותחים את חלון שינוי הסיסמה – לנקות שגיאות ישנות
  useEffect(() => {
    if (editPasswordMode) {
      setPwErrors({});
      dispatch(clearError());
    }
  }, [editPasswordMode, dispatch]);

  // ✅ להעלים את הודעת "סיסמה עודכנה" (או כל message) אחרי 3 שניות
  useEffect(() => {
    if (!message) return;   // אם אין הודעה – לא עושים כלום

    const t = setTimeout(() => {
      dispatch(clearMessage());
    }, 3000); // 3000ms = 3 שניות

    return () => clearTimeout(t); // ניקוי אם הקומפוננטה מתחלפת
  }, [message, dispatch]);



  if (loading || !user) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>טוען פרופיל...</p>;
  }

  const handleChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
    };

    try {
      await dispatch(updateProfile(payload)).unwrap();
      setEditMode(false);
    } catch (err) {
      console.log('updateProfile error (client):', err);
    }
  };

  const handleChangePassword = async () => {
    const localErrs = {};

    if (!currentPassword) {
      localErrs.currentPassword = 'יש להזין סיסמה נוכחית';
    }

    if (!newPassword) {
      localErrs.newPassword = 'יש להזין סיסמה חדשה';
    }

    if (confirm && confirm !== newPassword) {
      localErrs.confirm = 'הסיסמאות אינן תואמות';
    }

    if (Object.keys(localErrs).length) {
      setPwErrors(localErrs);   // נשארים בדף, בלי שליחת בקשה
      return;
    }

    // ✅ אין שגיאות מקומיות – מנקים ומתקדמים
    setPwErrors({});
    dispatch(clearError());     // לנקות updateErrors מהניסיון הקודם

    try {
      await dispatch(
        changePassword({ currentPassword, newPassword })
      ).unwrap();

      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      setEditPasswordMode(false);
      toast.success('הסיסמה עודכנה בהצלחה');
    } catch (err) {
      console.log('changePassword error (client):', err);
      // השגיאות מהשרת יישבו ב-updateErrors ויוצגו מתחת לשדות
    }
  };

  return (
    <div className="profile-container">
      <h1>הפרופיל שלי</h1>

      {/* ✅ הודעת הצלחה גלובלית – למשל אחרי שינוי סיסמה */}
      {message && (
        <div className="top-msg success" style={{ marginBottom: 10 }}>
          {message}
        </div>
      )}

      <div className="profile-top">
        <div className="profile-avatar">
          {user.firstName ? user.firstName[0].toUpperCase() : 'מ'}
        </div>

        <div className="profile-details">
          {editMode ? (
            <>
              {/* שגיאה כללית מטופס (אם קיימת) */}
              {updateErrors?.form && (
                <div
                  className="form-error"
                  style={{ color: 'red', marginBottom: 8 }}
                >
                  {updateErrors.form}
                </div>
              )}

              {/* שם פרטי */}
              <p>
                <strong>שם פרטי:</strong>{' '}
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {updateErrors?.firstName && (
                  <span
                    className="field-error"
                    style={{ color: 'red', marginRight: 8 }}
                  >
                    {updateErrors.firstName}
                  </span>
                )}
              </p>

              {/* שם משפחה */}
              <p>
                <strong>שם משפחה:</strong>{' '}
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {updateErrors?.lastName && (
                  <span
                    className="field-error"
                    style={{ color: 'red', marginRight: 8 }}
                  >
                    {updateErrors.lastName}
                  </span>
                )}
              </p>

              {/* אימייל */}
              <p>
                <strong>אימייל:</strong>{' '}
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {updateErrors?.email && (
                  <span
                    className="field-error"
                    style={{ color: 'red', marginRight: 8 }}
                  >
                    {updateErrors.email}
                  </span>
                )}
              </p>

              {/* טלפון */}
              <p>
                <strong>טלפון:</strong>{' '}
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {updateErrors?.phone && (
                  <span
                    className="field-error"
                    style={{ color: 'red', marginRight: 8 }}
                  >
                    {updateErrors.phone}
                  </span>
                )}
              </p>

              <p style={{ borderBottom: 'none' }}>
                <strong>כתובת:</strong>{' '}
              </p>
              <div style={{ paddingInlineStart: 15 }}>
                <CityStreetAuto
                  idPrefix="profile"
                  className="citystreet--profile"
                  city={formData.city}
                  address={formData.address}
                  onCityChange={(val) =>
                    setFormData(f => ({ ...f, city: val }))
                  }
                  onAddressChange={(val) =>
                    setFormData(f => ({ ...f, address: val }))
                  }
                  cityInputProps={{ className: 'profile-input' }}
                  streetInputProps={{ className: 'profile-input' }}
                />
              </div>

              <button className="edit-btn save" onClick={handleSave}>
                שמור
              </button>
              <button
                className="edit-btn cancel"
                onClick={() => setEditMode(false)}
              >
                ביטול
              </button>
            </>
          ) : (
            <>
              <p><strong>שם פרטי:</strong> {user.firstName}</p>
              <p><strong>שם משפחה:</strong> {user.lastName}</p>
              <p><strong>אימייל:</strong> {user.email}</p>
              <p><strong>טלפון:</strong> {user.phone}</p>
              <p>
                <strong>כתובת:</strong>{' '}
                {user.city ? `${user.city}, ` : ''}
                {user.address}
              </p>
              <button
                className="edit-btn"
                onClick={() => setEditMode(true)}
              >
                עריכת משתמש
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🔐 שינוי סיסמה */}
      <div className="change-password-section">
        {editPasswordMode ? (
          <div className="change-password-box">
            <h3>שינוי סיסמה</h3>

            {/* שגיאה כללית מהשרת (אם יש) */}
            {updateErrors?.form && (
              <div className="error" style={{ color: 'red', marginBottom: 8 }}>
                {updateErrors.form}
              </div>
            )}

            <p>
              <strong>סיסמה נוכחית:</strong>{' '}
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              {(pwErrors.currentPassword || updateErrors?.currentPassword) && (
                <span
                  className="field-error"
                  style={{ color: 'red', marginRight: 8 }}
                >
                  {pwErrors.currentPassword || updateErrors.currentPassword}
                </span>
              )}
            </p>

            <p>
              <strong>סיסמה חדשה:</strong>{' '}
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {(pwErrors.newPassword || updateErrors?.newPassword) && (
                <span
                  className="field-error"
                  style={{ color: 'red', marginRight: 8 }}
                >
                  {pwErrors.newPassword || updateErrors.newPassword}
                </span>
              )}
            </p>

            <p>
              <strong>אימות סיסמה חדשה:</strong>{' '}
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {pwErrors.confirm && (
                <span
                  className="field-error"
                  style={{ color: 'red', marginRight: 8 }}
                >
                  {pwErrors.confirm}
                </span>
              )}
            </p>

            <button className="edit-btn save" onClick={handleChangePassword}>
              שמירת סיסמה חדשה
            </button>
            <button
              className="edit-btn cancel"
              onClick={() => {
                setEditPasswordMode(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirm('');
                setPwErrors({});
              }}
            >
              ביטול
            </button>
          </div>
        ) : (
          <button
            className="edit-btn"
            style={{ marginTop: '20px' }}
            onClick={() => setEditPasswordMode(true)}
          >
            שינוי סיסמה
          </button>
        )}
      </div>

      <div className="profile-groups">
        <h2>קבוצות שאני מנהלת</h2>
        <ul>
          {userGroups.created.length > 0
            ? userGroups.created.map(g => (
              <li key={g._id} className="group-item">
                <span>{g.name}</span>
                <button onClick={() => navigate(`/groups/${g._id}`)}>
                  לפרטי הקבוצה
                </button>
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
                <button onClick={() => navigate(`/groups/${g._id}`)}>
                  לפרטי הקבוצה
                </button>
              </li>
            ))
            : <li>אין קבוצות</li>}
        </ul>
      </div>
    </div>
  );
}
