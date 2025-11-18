import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import './NavBar.css';

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // <-- כאן מקבלים את הנתיב הנוכחי

  const { token, firstName, lastName } = useSelector((s) => s.auth);
  const isAuthed = Boolean(token);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : '';
  const initial = fullName ? fullName[0] : '';

  const links = [
    { name: 'בית', path: '/' },
    { name: 'קבוצות', path: '/groups' },
    { name: 'אודות', path: '/about' },
    { name: 'מדריך למשתמש', path: '/user-guide' },
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
            יציאה
          </button>
        ) : (
          <Link to="/login">התחברות</Link>
        )}
      </div>

      <div
        className="site-name"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        בחירות
      </div>
    </nav>
  );
};

export default NavBar;
