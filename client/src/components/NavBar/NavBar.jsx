import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import './NavBar.css';

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, firstName, lastName } = useSelector((s) => s.auth);
  const isAuthed = Boolean(token);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : '';
  const initial = fullName ? fullName[0] : '';

  return (
    <nav className="navbar">
      {/* עיגול פרופיל מוצג רק כשמחובר */}
      {isAuthed && (
        <Link to="/profile" className="profile">
          {initial}
        </Link>
      )}

      <div className="links">
        {/* קישורים שמוצגים לכולם */}
        <Link to="/">בית</Link>
        <Link to="/groups">קבוצות</Link>
 <Link to="/about">אודות</Link>
  <Link to="/user-guide">מדריך למשתמש</Link>
        {/* כפתור או קישור לפי מצב ההתחברות */}
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
  style={{ cursor: 'pointer' }} // מציג שהאלמנט לחיץ
>
  בחירות
</div>
    </nav>
  );
};

export default NavBar;
