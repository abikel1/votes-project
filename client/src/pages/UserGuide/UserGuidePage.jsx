// src/pages/UserGuide/UserGuidePage.jsx
import React from 'react';
import './UserGuidePage.css';

export default function UserGuidePage() {
  const steps = [
    { title: 'הרשמה והתחברות', description: 'יצירת חשבון חדש או התחברות לחשבון קיים מאפשרת לך להשתמש בכל הפיצ\'רים של האתר.' },
    { title: 'ניהול קבוצות', description: 'צור קבוצות, נהל חברים וקבע הצבעות בקלות וביעילות.' },
    { title: 'הצבעות', description: 'הצבע על נושאים, עקוב אחרי תוצאות בזמן אמת, והבן את דעת הקבוצה בצורה ברורה.' },
    { title: 'התראות ומעקב', description: 'קבל התראות על שינויים, הצבעות חדשות או בקשות להצטרפות.' },
  ];

  const tips = [
    { title: 'קיצורי דרך', description: 'למד את הקיצורים שלנו לחיסכון בזמן ובקלות שימוש.' },
    { title: 'שימוש בטלפון', description: 'הממשק מותאם גם למכשירים ניידים ונוח לשימוש מכל מקום.' },
    { title: 'שמירה על פרטיות', description: 'המערכת שומרת על המידע האישי שלך והצבעותיך מאובטחות.' },
    { title: 'תמיכה מקצועית', description: 'פנה אלינו בכל שאלה – אנחנו כאן כדי לעזור.' },
  ];

  return (
    <div className="user-guide-page">
      <h1>מדריך למשתמש</h1>
      <p className="guide-subtitle">כל מה שאתה צריך לדעת כדי להשתמש באתר בצורה נוחה ובטוחה</p>

      <div className="cards-container">
        {steps.map((step, index) => (
          <div key={index} className="card">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div className="highlight-card">
        <h2>טיפ חשוב למשתמש</h2>
        <p>כדי ליהנות מהמערכת בצורה מיטבית, הקפד לבדוק את כל ההגדרות של הקבוצה שלך, נהל את החברים בצורה מסודרת, ועקוב אחרי ההתראות בזמן אמת.</p>
      </div>

      <div className="mini-cards-container">
        {tips.map((tip, index) => (
          <div key={index} className="mini-card">
            <h4>{tip.title}</h4>
            <p>{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
