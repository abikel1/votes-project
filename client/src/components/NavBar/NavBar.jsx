import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import './NavBar.css';
import LanguageSwitcher from '../LanguageSwitcher.jsx';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { token, firstName, lastName } = useSelector((s) => s.auth);
  const isAuthed = Boolean(token);

  const onLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    navigate('/');
  };

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : '';
  const initial = fullName ? fullName[0] : '';

  const links = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.groups'), path: '/groups' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.guide'), path: '/user-guide' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* תפריט המבורגר */}
      <div 
        className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* פרופיל */}
      {isAuthed && (
        <Link to="/profile" className="profile" onClick={handleLinkClick}>
          {initial}
        </Link>
      )}

      {/* קישורים */}
      <div className={`links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={location.pathname === link.path ? 'active-link' : ''}
            onClick={handleLinkClick}
          >
            {link.name}
          </Link>
        ))}

        {isAuthed ? (
          <button type="button" className="logout-btn" onClick={onLogout}>
            {t('nav.logout')}
          </button>
        ) : (
          <Link
            to="/login"
            className={location.pathname === '/login' ? 'active-link' : ''}
            onClick={handleLinkClick}
          >
            {t('nav.login')}
          </Link>
        )}
      </div>

      {/* מתג שפות */}
      <LanguageSwitcher />

      {/* שם האתר */}
      <div
        className="site-name"
        onClick={() => {
          navigate('/');
          setMobileMenuOpen(false);
        }}
      >
        {t('app.title')}
      </div>
    </nav>
  );
};

export default NavBar;