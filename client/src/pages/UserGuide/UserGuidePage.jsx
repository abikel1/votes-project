import React, { useState } from 'react';
import { Play, Users, Vote, Bell, HelpCircle, Zap, Smartphone, Shield, Headphones, ChevronDown, ChevronUp } from 'lucide-react';
import './UserGuidePage.css'; // קישור לקובץ CSS חיצוני

export default function EnhancedUserGuide() {
  const [expandedSection, setExpandedSection] = useState(null);
  const toggleSection = (index) => setExpandedSection(expandedSection === index ? null : index);

  const FlowDiagram = () => (
    <div className="flow-diagram">
      <div className="flow-container">
        <div className="flow-step">
          <div className="flow-box"><Users className="icon" /></div>
          <p className="flow-label">הרשמה</p>
        </div>
        <div className="flow-arrow">&larr;</div>
        <div className="flow-step">
          <div className="flow-box"><Users className="icon" /></div>
          <p className="flow-label">יצירת קבוצה</p>
        </div>
        <div className="flow-arrow">&larr;</div>
        <div className="flow-step">
          <div className="flow-box"><Vote className="icon" /></div>
          <p className="flow-label">הצבעות</p>
        </div>
        <div className="flow-arrow">&larr;</div>
        <div className="flow-step">
          <div className="flow-box"><Bell className="icon" /></div>
          <p className="flow-label">התראות</p>
        </div>
      </div>
    </div>
  );

  const steps = [
    { icon: <Users className="icon-large" />, title: 'הרשמה למערכת', description: 'צור חשבון חדש במערכת תוך דקות ספורות', details: ['מלא את הפרטים הבסיסיים','אמת את כתובת האימייל שלך','צור סיסמה חזקה ומאובטחת','התחל להשתמש במערכת מיד'] },
    { icon: <Users className="icon-large" />, title: 'ניהול קבוצות', description: 'צור וצרף קבוצות, הזמן חברים ונהל הרשאות', details: ['צור קבוצה חדשה עם שם ותיאור','הזמן משתמשים באמצעות קישור או אימייל','הגדר הרשאות ותפקידים','עקוב אחר פעילות הקבוצה'] },
    { icon: <Vote className="icon-large" />, title: 'הצבעות וסקרים', description: 'צור הצבעות, הצבע, וצפה בתוצאות בזמן אמת', details: ['צור הצבעה חדשה עם אפשרויות מרובות','הגדר זמן סיום להצבעה','הצבע באופן פשוט ומהיר','צפה בתוצאות גרפיות ומפורטות'] },
    { icon: <Bell className="icon-large" />, title: 'התראות ועדכונים', description: 'קבל התראות על פעילות חשובה בקבוצות שלך', details: ['התראות על הצבעות חדשות','עדכונים על תוצאות הצבעות','הזמנות לקבוצות חדשות','התאמה אישית של העדפות התראות'] }
  ];

  const tips = [
    { icon: <Zap className="icon-small" />, title: 'קיצורי דרך', description: 'שימוש במקלדת למעבר מהיר בין דפים' },
    { icon: <Smartphone className="icon-small" />, title: 'גרסה ניידת', description: 'השתמש במערכת מכל מכשיר, בכל מקום' },
    { icon: <Shield className="icon-small" />, title: 'פרטיות ואבטחה', description: 'המידע שלך מוגן ומאובטח' },
    { icon: <Headphones className="icon-small" />, title: 'תמיכה טכנית', description: 'צוות התמיכה זמין לעזרה 24/7' }
  ];

  return (
    <div className="container" dir="rtl">
      <header className="hero">
        <h1 className="hero-title">מדריך למשתמש</h1>
        <p className="hero-subtitle">כל מה שצריך לדעת על המערכת במקום אחד</p>
        <div className="hero-buttons">
          <button className="btn-primary">התחל עכשיו</button>
          <button className="btn-secondary">צפה בווידאו</button>
        </div>
      </header>

      <section className="flow-section">
        <h2 className="section-title">תרשים זרימת המערכת</h2>
        <FlowDiagram />
      </section>

      <section className="steps-section">
        {steps.map((step,index) => (
          <div key={index} className="step-card" onClick={()=>toggleSection(index)}>
            <div className="step-header">
              <div className="step-icon">{step.icon}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {expandedSection === index ? <ChevronUp className="icon-small"/> : <ChevronDown className="icon-small"/>}
            </div>
            {expandedSection===index && (
              <ul className="step-details">
                {step.details.map((d,i)=><li key={i}><span>{i+1}</span>{d}</li>)}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="video-card">
        <video controls width="100%">
          <source src="EX.mp4" type="video/mp4" />
        </video>
      </section>

      <section className="tips-section">
        <h2 className="section-title">טיפים ותכונות נוספות</h2>
        <div className="tips-grid">
          {tips.map((tip,i)=>(
            <div key={i} className="tip-card">
              <div className="tip-icon">{tip.icon}</div>
              <h4>{tip.title}</h4>
              <p>{tip.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
