import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProfile,
  updateProfile,
  changePassword,
  clearError,
  clearMessage,
} from '../../slices/authSlice';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import CityStreetAuto from '../../components/CityStreetAuto';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import http from '../../api/http';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const updateErrors = useSelector((state) => state.auth.updateErrors);
  const message = useSelector((state) => state.auth.message);
  const [userGroups, setUserGroups] = useState({ created: [], joined: [] });
  const navigate = useNavigate();
  const [appliedGroups, setAppliedGroups] = useState([]);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwErrors, setPwErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
    if (!user || !token) return;

    http.get('/groups/applied')
      .then((res) => {
        setAppliedGroups(res.data);
      })
      .catch((err) => {
        console.error('Error fetching applied groups:', err);
      });
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) return;

    http
      .get('/groups/my')
      .then((res) => {
        setUserGroups(res.data);
      })
      .catch((err) => {
        console.error('Error fetching user groups:', err);
      });
  }, [user, token]);

  useEffect(() => {
    setPwErrors((prev) => ({
      ...prev,
      confirm:
        confirm && newPassword && confirm !== newPassword
          ? t('profile.passwordErrors.mismatch', 'הסיסמאות אינן תואמות')
          : undefined,
    }));
  }, [newPassword, confirm, t]);

  useEffect(() => {
    if (showPasswordModal) {
      setPwErrors({});
      dispatch(clearError());
    }
  }, [showPasswordModal, dispatch]);

  useEffect(() => {
    if (!message) return;

    const tmr = setTimeout(() => {
      dispatch(clearMessage());
    }, 3000);

    return () => clearTimeout(tmr);
  }, [message, dispatch]);

  if (loading || !user) {
    return (
      <p style={{ textAlign: 'center', marginTop: '50px' }}>
        {t('profile.loading', 'טוען פרופיל...')}
      </p>
    );
  }

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
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
      localErrs.currentPassword = t(
        'profile.passwordErrors.currentRequired',
        'יש להזין סיסמה נוכחית'
      );
    }

    if (!newPassword) {
      localErrs.newPassword = t(
        'profile.passwordErrors.newRequired',
        'יש להזין סיסמה חדשה'
      );
    }

    if (confirm && confirm !== newPassword) {
      localErrs.confirm = t(
        'profile.passwordErrors.mismatch',
        'הסיסמאות אינן תואמות'
      );
    }

    if (Object.keys(localErrs).length) {
      setPwErrors(localErrs);
      return;
    }

    setPwErrors({});
    dispatch(clearError());

    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();

      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      setShowPasswordModal(false);
      toast.success(
        t('profile.passwordUpdated', 'הסיסמה עודכנה בהצלחה')
      );
    } catch (err) {
      console.log('changePassword error (client):', err);
      if (err && typeof err === 'object') {
        setPwErrors((prev) => ({
          ...prev,
          ...err,
        }));
      } else {
        setPwErrors((prev) => ({
          ...prev,
          form: t('auth.changePassword.genericError', 'עדכון הסיסמה נכשל'),
        }));
      }
    }
  };

  return (
    <div className="profile-container">
      <h1>{t('profile.title', 'הפרופיל שלי')}</h1>
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
              {updateErrors?.form && (
                <div className="form-error" style={{ marginBottom: 8 }}>
                  {updateErrors.form}
                </div>
              )}

              <p>
                <strong>{t('profile.firstName', 'שם פרטי')}:</strong>{' '}
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {updateErrors?.firstName && (
                  <span className="field-error" style={{ marginRight: 8 }}>
                    {updateErrors.firstName}
                  </span>
                )}
              </p>

              <p>
                <strong>{t('profile.lastName', 'שם משפחה')}:</strong>{' '}
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {updateErrors?.lastName && (
                  <span className="field-error" style={{ marginRight: 8 }}>
                    {updateErrors.lastName}
                  </span>
                )}
              </p>

              <p>
                <strong>{t('profile.email', 'אימייל')}:</strong>{' '}
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {updateErrors?.email && (
                  <span className="field-error" style={{ marginRight: 8 }}>
                    {updateErrors.email}
                  </span>
                )}
              </p>

              <p>
                <strong>{t('profile.phone', 'טלפון')}:</strong>{' '}
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {updateErrors?.phone && (
                  <span className="field-error" style={{ marginRight: 8 }}>
                    {updateErrors.phone}
                  </span>
                )}
              </p>

              <p style={{ borderBottom: 'none' }}>
                <strong>{t('profile.address', 'כתובת')}:</strong>{' '}
              </p>
              <div style={{ paddingInlineStart: 15 }}>
                <CityStreetAuto
                  idPrefix="profile"
                  className="citystreet--profile"
                  city={formData.city}
                  address={formData.address}
                  onCityChange={(val) =>
                    setFormData((f) => ({ ...f, city: val }))
                  }
                  onAddressChange={(val) =>
                    setFormData((f) => ({ ...f, address: val }))
                  }
                  cityInputProps={{ className: 'profile-input' }}
                  streetInputProps={{ className: 'profile-input' }}
                />
              </div>

              <button className="edit-btn save" onClick={handleSave}>
                {t('common.save', 'שמור')}
              </button>
              <button
                className="edit-btn cancel"
                onClick={() => setEditMode(false)}
              >
                {t('common.cancel', 'ביטול')}
              </button>
            </>
          ) : (
            <>
              <p>
                <strong>{t('profile.firstName', 'שם פרטי')}:</strong>{' '}
                {user.firstName}
              </p>
              <p>
                <strong>{t('profile.lastName', 'שם משפחה')}:</strong>{' '}
                {user.lastName}
              </p>
              <p>
                <strong>{t('profile.email', 'אימייל')}:</strong> {user.email}
              </p>
              <p>
                <strong>{t('profile.phone', 'טלפון')}:</strong> {user.phone}
              </p>
              <p>
                <strong>{t('profile.address', 'כתובת')}:</strong>{' '}
                {user.city ? `${user.city}, ` : ''}
                {user.address}
              </p>
              <div className="profile-actions">
                <button
                  className="edit-btn"
                  onClick={() => setEditMode(true)}
                >
                  {t('profile.editUser', 'עריכת משתמש')}
                </button>
                <button
                  className="edit-btn"
                  onClick={() => setShowPasswordModal(true)}
                >
                  {t('profile.changePassword', 'שינוי סיסמה')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="profile-groups">
        <h2>{t('profile.groupsOwned', 'קבוצות שאני מנהל/ת')}</h2>
        <ul>
          {userGroups.created.length > 0 ? (
            userGroups.created.map((g) => (
              <li key={g._id} className="group-item">
                <span>{g.name}</span>
                <button onClick={() => navigate(`/groups/${g._id}`)}>
                  {t('profile.viewGroup', 'לפרטי הקבוצה')}
                </button>
              </li>
            ))
          ) : (
            <li>{t('profile.noGroups', 'אין קבוצות')}</li>
          )}
        </ul>

        <div className="profile-groups-divider" />

        <h2>{t('profile.groupsJoined', 'קבוצות שאני מחובר/ת')}</h2>
        <ul>
          {userGroups.joined.length > 0 ? (
            userGroups.joined.map((g) => (
              <li key={g._id} className="group-item">
                <span>{g.name}</span>
                <button onClick={() => navigate(`/groups/${g._id}`)}>
                  {t('profile.viewGroup', 'לפרטי הקבוצה')}
                </button>
              </li>
            ))
          ) : (
            <li>{t('profile.noGroups', 'אין קבוצות')}</li>
          )}
        </ul>



        <div className="profile-groups-divider" />

        <h2>{t('profile.groupsApplied', 'קבוצות שבהן אני מועמד/ת')}</h2>
        <ul>
          {appliedGroups.length > 0 ? (
            appliedGroups.map((g) => (
              <li key={g._id} className="group-item">
                <span>{g.name}</span>
                <button onClick={() => navigate(`/groups/${g._id}`)}>
                  {t('profile.viewGroup', 'לפרטי הקבוצה')}
                </button>
              </li>
            ))
          ) : (
            <li>{t('profile.noGroups', 'אין קבוצות')}</li>
          )}
        </ul>

      </div>


      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{t('profile.changePassword', 'שינוי סיסמה')}</h3>
            {pwErrors.form && (
              <div className="error">{pwErrors.form}</div>
            )}

            {pwErrors.currentPassword && (
              <div className="error">{pwErrors.currentPassword}</div>
            )}
            <p>
              <strong>
                {t('profile.currentPassword', 'סיסמה נוכחית')}:
              </strong>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </p>

            {pwErrors.newPassword && (
              <div className="error">{pwErrors.newPassword}</div>
            )}
            <p>
              <strong>
                {t('profile.newPassword', 'סיסמה חדשה')}:
              </strong>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </p>

            {pwErrors.confirm && (
              <div className="error">{pwErrors.confirm}</div>
            )}
            <p>
              <strong>
                {t('profile.confirmPassword', 'אימות סיסמה')}:
              </strong>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </p>

            <div className="modal-actions">
              <button className="edit-btn save" onClick={handleChangePassword}>
                {t('common.save', 'שמור')}
              </button>
              <button
                className="edit-btn cancel"
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirm('');
                  setPwErrors({});
                }}
              >
                {t('common.cancel', 'ביטול')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
