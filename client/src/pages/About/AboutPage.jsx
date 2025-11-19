// src/pages/About/AboutPage.jsx
import React from 'react';
import './AboutPage.css';

export default function AboutPage() {
  const cards = [
    { title: 'מה אנחנו עושים', description: 'פלטפורמה נוחה ונגישה לניהול קבוצות והצבעות, המאפשרת לכל המשתמשים לשלוט בתהליך בצורה פשוטה וברורה.' },
    { title: 'הצלחות שלנו', description: 'אלפי משתמשים מרוצים משתמשים במערכת מדי יום, עם חוויית משתמש חלקה ומהירה.' },
    // { title: 'למה לבחור בנו', description: 'מערכת פשוטה, מאובטחת ומותאמת לכל הקבוצות, עם תמיכה מלאה ושירות מהיר ומקצועי.' },
    { title: 'חיסכון במשאבים', description: 'חוסכים זמן, כסף וכוח אדם בניהול הקבוצה וההצבעות, תוך שמירה על סדר ויעילות.' },
  ];

  const miniCards = [
    { title: 'ניהול פשוט', description: 'כל הקבוצות וההצבעות במקום אחד, עם ממשק ידידותי.' },
    { title: 'אבטחה', description: 'הגנה מלאה על מידע אישי והצבעות המשתמשים.' },
    { title: 'תמיכה זמינה', description: 'צוות מקצועי זמין בכל עת לעזרה ולפתרון בעיות.' },
    { title: 'התאמה אישית', description: 'אפשרויות התאמה אישית של קבוצות ותצוגות לפי צרכי המשתמש.' },
  ];

  return (
    <div className="about-page">
      <h1>אודות</h1>
      <p className="about-subtitle">הכירו את הפלטפורמה שלנו – פשוטה, יעילה ובטוחה</p>

      <div className="cards-container">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>

      <div className="highlight-card">
        <h2>מדוע כדאי לעבוד איתנו?</h2>
        <p>אנחנו מקפידים על פשטות, יעילות וביטחון. הפלטפורמה שלנו מספקת פתרון מלא לניהול קבוצות והצבעות, חוסכת זמן ומשאבים, ומביאה את המשתמשים לתוצאה מיטבית.</p>
      </div>

      <div className="mini-cards-container">
        {miniCards.map((card, index) => (
          <div key={index} className="mini-card">
            <h4>{card.title}</h4>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
