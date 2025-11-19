// src/components/layout/Footer.jsx
import { FaInstagram, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>מערכת ההצבעות</h4>
          <p>פלטפורמה פשוטה לניהול הצבעות וקבוצות.<br />יצירת קבוצות, הוספת מועמדים, שליחת קישורי הצבעה ועוד.</p>
          <p className="footer-tagline">ניהול הצבעות מסודר, מאובטח וקל לשימוש – במקום אחד.</p>
        </div>

        <div className="footer-col">
          <h4>קישורים שימושיים</h4>
          <ul className="footer-links">
            <li><a href="/">עמוד הבית</a></li>
            <li><a href="/groups">הקבוצות</a></li>
            <li><a href="/user-guide">מדריך למשתמש</a></li>
            <li><a href="/about">אודות</a></li>
            <li><a href="/contact">צור קשר</a></li> {/* קישור לדף חדש */}
          </ul>

          <div className="footer-social">
            <span className="footer-social-title">עקוב אחרינו</span>
            <div className="footer-social-icons">
              <a href="https://wa.me/972500000000" target="_blank" rel="noreferrer"><FaWhatsapp /></a>
              <a href="https://www.instagram.com/your_page" target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href="https://t.me/your_channel" target="_blank" rel="noreferrer"><FaTelegramPlane /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-text">
          <span>© {year} מערכת ההצבעות</span>
          <span>כל הזכויות שמורות</span>
        </div>
      </div>
    </footer>
  );
}
