import React, { useState, useEffect } from 'react';
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

  const [initial, setInitial] = useState('');
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) setInitial(userName[0]); // לוקח את האות הראשונה
  }, []);

  return (
    <nav className="navbar">
      <Link to="/profile" className="profile">
        {initial}
      </Link>

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
