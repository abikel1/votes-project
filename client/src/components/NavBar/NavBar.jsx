import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import './NavBar.css';
import LanguageSwitcher from '../LanguageSwitcher.jsx';
import { useTranslation } from 'react-i18next';
// import logo from '../../assets/logo.png';

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();          // 👈 מוסיפים

  const { token, firstName, lastName } = useSelector((s) => s.auth);
  const isAuthed = Boolean(token);

  const onLogout = () => {
    dispatch(logout());
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

  return (
    <nav className="navbar">
      {isAuthed && (
        <Link to="/profile" className="profile">
          {initial}
        </Link>
      )}

      <div className="links">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={location.pathname === link.path ? 'active-link' : ''}
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
          >
            {t('nav.login')}
          </Link>
        )}
      </div>

      <LanguageSwitcher />

      <div
        className="site-name"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        {t('app.title')}
      </div>
    </nav>
  );
};

export default NavBar;
