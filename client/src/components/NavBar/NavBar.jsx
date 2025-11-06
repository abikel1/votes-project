import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import './NavBar.css';

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, userName } = useSelector((s) => s.auth);
  const isAuthed = Boolean(token);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const letter = (userName?.trim?.()[0] || 'מ').toUpperCase();

  return (
    <nav className="navbar">
      <div className="profile" title={userName || 'אורח'}>
        {letter}
      </div>

      <div className="links">
        <Link to="/">בית</Link>
        <Link to="/groups">קבוצות</Link>
        {isAuthed && <Link to="/groups/create">צור קבוצה</Link>}
        {!isAuthed && <Link to="/register">הרשמה</Link>}
        {!isAuthed && <Link to="/login">התחברות</Link>}
        {isAuthed && (
          <button type="button" className="logout-btn" onClick={onLogout}>
            יציאה
          </button>
        )}
      </div>

      <div className="site-name">בחירות</div>
    </nav>
  );
};

export default NavBar;
