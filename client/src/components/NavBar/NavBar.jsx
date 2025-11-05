import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="profile">מ</div>

      <div className="links">
        <Link to="/">בית</Link>
        <Link to="/register">הרשמה</Link>
        <Link to="/login">התחברות</Link>
      </div>
      <div className="site-name">בחירות</div>

    </nav>
  );
};

export default NavBar;
