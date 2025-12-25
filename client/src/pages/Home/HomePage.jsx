import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchGroups, selectGroupsWithOwnership } from '../../slices/groupsSlice';
import {
  HiClock,
  HiUserGroup,
  HiCheckCircle,
  HiPlus,
  HiChartBar,
  HiUser,
} from 'react-icons/hi';
import './HomePage.css';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      const isOpenToAll = !group.isLocked;

      if (isOpenToAll && (!endDate || endDate > now)) {
        active.push(group);
      } else if (isOpenToAll && endDate && endDate <= now) {
        const daysSinceClosed = Math.floor(
          (now - endDate) / (1000 * 60 * 60 * 24)
        );
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
    setRecentlyClosedGroups(recentlyClosed.slice(0, 10));
  }, [groups]);

  const getTimeRemaining = (endDate) => {
    if (!endDate) return t('home.time.noEndDate');

    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return t('home.time.ended');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (diff % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (days > 0) return `${days} ${t('home.time.days')}`;
    if (hours > 0) return `${hours} ${t('home.time.hours')}`;
    return `${minutes} ${t('home.time.minutes')}`;
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
      toast.error(t('home.toasts.loginToCreate'));
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
          <p>{t('home.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="home-error">
          <h2>⚠️ {t('home.error.title')}</h2>
          <p>{error}</p>
          <button
            onClick={() => dispatch(fetchGroups())}
            className="retry-btn"
          >
            {t('home.error.retry')}
          </button>
        </div>
      </div>
    );
  }

  const onLoginClick = () => {
    navigate('/login');
  };


  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{t('home.hero.title')}</h1>
          <p className="hero-subtitle">{t('home.hero.subtitle')}</p>
          <button className="hero-cta" onClick={onCreateGroupClick}>
            <HiPlus className="btn-icon" />
            {t('home.hero.cta')}
          </button>

          {(!authId && !authEmail) && (
            <button className="hero-cta hero-login" onClick={onLoginClick}>
              {t('home.hero.login')}
            </button>
          )}

        </div>
        <div className="scroll-indicator">
          <span>{t('home.hero.scrollDown')}</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      <div className="main-content">
        <div className="content-wrapper">
          <section className="groups-column active-column">
            <div className="column-header">
              <div className="header-title">
                <HiCheckCircle className="header-icon active" />
                <h2>{t('home.active.title')}</h2>
              </div>
              <span className="badge-count active-badge">
                {activeGroups.length}
              </span>
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
                      <h3 className="card-title">
                        {group.name || t('home.common.noName')}
                      </h3>
                      {group.description && (
                        <p className="card-description">
                          {group.description}
                        </p>
                      )}

                      <div className="card-meta">
                        <div className="meta-item time-meta">
                          <HiClock className="meta-icon" />
                          <span className="time-text">
                            {getTimeRemaining(group.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-column">
                <p>{t('home.active.empty')}</p>
              </div>
            )}
          </section>
          <section className="groups-column closed-column">
            <div className="column-header">
              <div className="header-title">
                <HiChartBar className="header-icon closed" />
                <h2>{t('home.closed.title')}</h2>
              </div>
              <span className="badge-count closed-badge">
                {recentlyClosedGroups.length}
              </span>
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
                      <h3 className="card-title">
                        {group.name || t('home.common.noName')}
                      </h3>
                      {group.description && (
                        <p className="card-description">
                          {group.description}
                        </p>
                      )}

                      <div className="card-meta">
                      </div>

                      <button className="card-action-btn closed-btn">
                        {t('home.closed.viewResults')}
                        <span className="btn-arrow">←</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-column">
                <p>{t('home.closed.empty')}</p>
              </div>
            )}
          </section>
        </div>

        {activeGroups.length === 0 && recentlyClosedGroups.length === 0 && (
          <div className="empty-state-full">
            <div className="empty-icon">🗳️</div>
            <h2>{t('home.emptyState.title')}</h2>
            <p>{t('home.emptyState.subtitle')}</p>
            <button className="create-btn" onClick={onCreateGroupClick}>
              <HiPlus className="btn-icon" />
              {t('home.emptyState.create')}
            </button>
          </div>
        )}
      </div>

      <section className="quick-actions">
        <button
          className="action-btn"
          onClick={() => navigate('/groups')}
        >
          <HiUserGroup className="btn-icon" /> {t('home.actions.allGroups')}
        </button>

        {isAuthed && (
          <button
            className="action-btn"
            onClick={() => navigate('/profile')}
          >
            <HiUser className="btn-icon" /> {t('home.actions.myProfile')}
          </button>
        )}

        <button
          className="action-btn primary-action"
          onClick={onCreateGroupClick}
        >
          <HiPlus className="btn-icon" /> {t('home.actions.createGroup')}
        </button>
      </section>
    </div>
  );
};

export default HomePage;
