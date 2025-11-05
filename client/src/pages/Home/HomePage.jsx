import React from 'react';
import './HomePage.css';
import ballot from '../../assets/ballot.png'; // הכנסי כאן את התמונה שלך

const HomePage = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">בחירות</h1>
      <img src={ballot} alt="בחירות" className="home-image" />
    </div>
  );
};

export default HomePage;
