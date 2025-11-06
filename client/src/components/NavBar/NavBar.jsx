import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
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
        <Link to="/register">הרשמה</Link>
        <Link to="/login">התחברות</Link>
        <Link to="/groups">קבוצות</Link>
      </div>
      <div className="site-name">בחירות</div>

    </nav>
  );
};

export default NavBar;
