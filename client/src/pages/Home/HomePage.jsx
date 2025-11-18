import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchGroups, selectGroupsWithOwnership } from '../../slices/groupsSlice';
import { HiClock, HiUserGroup, HiCheckCircle, HiXCircle, HiPlus, HiChartBar, HiUser, HiOutlineBadgeCheck } from 'react-icons/hi';
import './HomePage.css';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const groups = useSelector(selectGroupsWithOwnership);
  const loading = useSelector((s) => s.groups.loading);
  const error = useSelector((s) => s.groups.error);
  const { userEmail: authEmail, userId: authId } = useSelector((s) => s.auth);

  const [activeGroups, setActiveGroups] = useState([]);
  const [recentlyClosedGroups, setRecentlyClosedGroups] = useState([]);

  const isAuthed = !!authId || !!authEmail || !!localStorage.getItem('authToken');

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (!groups || groups.length === 0) return;

    const now = new Date();
    const active = [];
    const recentlyClosed = [];

    groups.forEach((group) => {
      const endDate = group.endDate ? new Date(group.endDate) : null;
      const isOpenToAll = !group.isLocked && (group.members?.length === 0);

      if (isOpenToAll && (!endDate || endDate > now)) {
        active.push(group);
      } else if (isOpenToAll && endDate && endDate <= now) {
        const daysSinceClosed = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
        if (daysSinceClosed <= 30) {
          recentlyClosed.push(group);
        }
      }
    });

    active.sort((a, b) => {
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return new Date(a.endDate) - new Date(b.endDate);
    });

    recentlyClosed.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

    setActiveGroups(active.slice(0, 5));
    setRecentlyClosedGroups(recentlyClosed.slice(0, 5));
  }, [groups]);

  const getTimeRemaining = (endDate) => {
    if (!endDate) return 'ללא מועד סיום';

    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'הסתיים';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ימים`;
    if (hours > 0) return `${hours} שעות`;
    return `${minutes} דקות`;
  };

  const makeSlug = (name = '', id = '') =>
    encodeURIComponent(
      String(name).trim().toLowerCase().replace(/\s+/g, '-')
    ) || id;

  const handleGroupClick = (group) => {
    const slug = makeSlug(group.name, group._id);
    navigate(`/groups/${slug}`, { state: { groupId: group._id } });
  };

  const onCreateGroupClick = () => {
    if (!isAuthed) {
      alert('כדי ליצור קבוצה יש להתחבר תחילה.');
      navigate('/login', { state: { redirectTo: '/groups/create' } });
      return;
    }
    navigate('/groups/create');
  };

  const handleVoteClick = (group, e) => {
    e.stopPropagation();
    const slug = makeSlug(group.name, group._id);
    navigate(`/groups/${slug}`, { state: { groupId: group._id } });
  };

  if (loading && groups.length === 0) {
    return (
      <div className="home-page">
        <div className="home-loading">
          <div className="spinner"></div>
          <p>טוען קבוצות...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="home-error">
          <h2>⚠️ שגיאה</h2>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchGroups())} className="retry-btn">
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">מערכת הצבעה דמוקרטית</h1>
          <p className="hero-subtitle">קולך נשמע • ההחלטה שלנו</p>
          <button className="hero-cta" onClick={onCreateGroupClick}>
            <HiPlus className="btn-icon" />
            יצירת הצבעה חדשה
          </button>
        </div>
        <div className="scroll-indicator">
          <span>גלול למטה</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">

          {/* Active Groups - Right Column */}
          <section className="groups-column active-column">
            <div className="column-header">
              <div className="header-title">
                <HiCheckCircle className="header-icon active" />
                <h2>הצבעות פעילות</h2>
              </div>
              <span className="badge-count active-badge">{activeGroups.length}</span>
            </div>

            {activeGroups.length > 0 ? (
              <div className="groups-list">
                {activeGroups.map((group) => (
                  <div
                    key={group._id}
                    className="group-card active-card"
                    onClick={() => handleGroupClick(group)}
                  >
                    <div className="card-content">
                      <h3 className="card-title">{group.name || 'ללא שם'}</h3>
                      {group.description && (
                        <p className="card-description">{group.description}</p>
                      )}

                      <div className="card-meta">
                        <div className="meta-item">
                          <HiUserGroup className="meta-icon" />
                          <span>
                          {group.votes?.length || 0}

                          </span>
                        </div>

                        <div className="meta-item time-meta">
                          <HiClock className="meta-icon" />
                          <span className="time-text">{getTimeRemaining(group.endDate)}</span>
                        </div>
                      </div>

                      <button
                        className="card-action-btn active-btn"
                        onClick={(e) => handleVoteClick(group, e)}
                      >
                        הצבע עכשיו
                        <span className="btn-arrow">←</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-column">
                <p>אין הצבעות פעילות כרגע</p>
              </div>
            )}
          </section>

          {/* Closed Groups - Left Column */}
          <section className="groups-column closed-column">
            <div className="column-header">
              <div className="header-title">
                <HiChartBar className="header-icon closed" />
                <h2>תוצאות אחרונות</h2>
              </div>
              <span className="badge-count closed-badge">{recentlyClosedGroups.length}</span>
            </div>

            {recentlyClosedGroups.length > 0 ? (
              <div className="groups-list">
                {recentlyClosedGroups.map((group) => (
                  <div
                    key={group._id}
                    className="group-card closed-card"
                    onClick={() => handleGroupClick(group)}
                  >
                    <div className="card-content">
                      <h3 className="card-title">{group.name || 'ללא שם'}</h3>
                      {group.description && (
                        <p className="card-description">{group.description}</p>
                      )}

                      <div className="card-meta">
                        <div className="meta-item">
                          <HiUserGroup className="meta-icon" />
                          <span>
                         {group.votes?.length || 0}

                          </span>
                        </div>


                        <div className="meta-item">
                          <HiXCircle className="meta-icon closed-icon" />
                          <span>הסתיים</span>
                        </div>
                      </div>

                      <button className="card-action-btn closed-btn">
                        צפה בתוצאות
                        <span className="btn-arrow">←</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-column">
                <p>אין תוצאות אחרונות</p>
              </div>
            )}
          </section>

        </div>

        {/* Empty State - when no groups at all */}
        {activeGroups.length === 0 && recentlyClosedGroups.length === 0 && (
          <div className="empty-state-full">
            <div className="empty-icon">🗳️</div>
            <h2>אין קבוצות זמינות כרגע</h2>
            <p>כשיהיו הצבעות פעילות, הן יופיעו כאן</p>
            <button className="create-btn" onClick={onCreateGroupClick}>
              <HiPlus className="btn-icon" />
              צור קבוצה חדשה
            </button>
          </div>
        )}

        
      </div>

      {/* Quick Actions Footer */}
      <section className="quick-actions">
        <button className="action-btn" onClick={() => navigate('/groups')}>
          <HiUserGroup className="btn-icon" /> כל חדרי ההצבעה
        </button>

        <button className="action-btn" onClick={() => navigate('/profile')}>
          <HiUser className="btn-icon" /> הפרופיל שלי
        </button>

        <button className="action-btn primary-action" onClick={onCreateGroupClick}>
          <HiPlus className="btn-icon" /> יצירת קבוצה
        </button>


      </section>
    </div>
  );
};

export default HomePage;