// src/components/layout/Footer.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMail } from '../../slices/mailSlice';
import { FaInstagram, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import './Footer.css';

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || 'my-contact@example.com';

function ContactForm() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.mail);

  const [fullName, setFullName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({}); // שגיאות לטופס

  const validate = () => {
    const errors = {};

    // שם מלא – חובה
    if (!fullName.trim()) {
      errors.fullName = 'נא למלא שם מלא';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'השם קצר מדי';
    }

    // אימייל
    if (!fromEmail.trim()) {
      errors.fromEmail = 'נא למלא אימייל לחזרה';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fromEmail.trim())) {
        errors.fromEmail = 'פורמט אימייל אינו תקין';
      }
    }

    // הודעה
    if (!message.trim()) {
      errors.message = 'נא לכתוב הודעה';
    } else if (message.trim().length < 5) {
      errors.message = 'ההודעה קצרה מדי';
    }

    // טלפון (רק אם מולא)
    if (phone.trim()) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 10) {
        errors.phone = 'מספר הטלפון אינו תקין';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSent(false);

    const isValid = validate();
    if (!isValid) return;

    const subject = `פנייה חדשה מהאתר – ${fullName.trim()}`;
    const text = `
שם: ${fullName || '-'}
דוא"ל לפנייה חוזרת: ${fromEmail || '-'}
טלפון: ${phone || '-'}

הודעה:
${message}
`.trim();

    try {
      await dispatch(
        sendMail({
          to: CONTACT_EMAIL,
          subject,
          text,
        }),
      ).unwrap();

      setSent(true);

      // איפוס כל השדות של הטופס
      setFullName('');
      setFromEmail('');
      setPhone('');
      setMessage('');
      setFieldErrors({});
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form className="footer-contact-form" onSubmit={onSubmit}>
      <h4>צור קשר</h4>

      <div className="footer-field">
        <label>שם מלא *</label>
        <input
          type="text"
          className={fieldErrors.fullName ? 'input-error' : ''}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (fieldErrors.fullName) {
              setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
            }
          }}
          placeholder="איך לפנות אלייך?"
        />
        {fieldErrors.fullName && (
          <div className="footer-field-error">{fieldErrors.fullName}</div>
        )}
      </div>

      <div className="footer-field">
        <label>אימייל לחזרה *</label>
        <input
          type="email"
          className={fieldErrors.fromEmail ? 'input-error' : ''}
          value={fromEmail}
          onChange={(e) => {
            setFromEmail(e.target.value);
            if (fieldErrors.fromEmail) {
              setFieldErrors((prev) => ({ ...prev, fromEmail: undefined }));
            }
          }}
          placeholder="name@example.com"
        />
        {fieldErrors.fromEmail && (
          <div className="footer-field-error">{fieldErrors.fromEmail}</div>
        )}
      </div>

      <div className="footer-field">
        <label>טלפון (אופציונלי)</label>
        <input
          type="tel"
          className={fieldErrors.phone ? 'input-error' : ''}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (fieldErrors.phone) {
              setFieldErrors((prev) => ({ ...prev, phone: undefined }));
            }
          }}
          placeholder="050-0000000"
        />
        {fieldErrors.phone && (
          <div className="footer-field-error">{fieldErrors.phone}</div>
        )}
      </div>

      <div className="footer-field">
        <label>הודעה *</label>
        <textarea
          rows={3}
          className={fieldErrors.message ? 'input-error' : ''}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (fieldErrors.message) {
              setFieldErrors((prev) => ({ ...prev, message: undefined }));
            }
          }}
          placeholder="איך אפשר לעזור?"
        />
        {fieldErrors.message && (
          <div className="footer-field-error">{fieldErrors.message}</div>
        )}
      </div>

      <button
        className="footer-btn"
        type="submit"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'שולח/ת…' : 'שלח/י הודעה'}
      </button>

      {sent && !error && (
        <div className="footer-ok">ההודעה נשלחה, נחזור אלייך בהקדם 🙂</div>
      )}
      {error && <div className="footer-err">{error}</div>}
    </form>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>מערכת ההצבעות</h4>
          <p>
            פלטפורמה פשוטה לניהול הצבעות וקבוצות.
            <br />
            יצירת קבוצות, הוספת מועמדים, שליחת קישורי הצבעה ועוד.
          </p>
          <p className="footer-tagline">
            ניהול הצבעות מסודר, מאובטח וקל לשימוש – במקום אחד.
          </p>
        </div>

        <div className="footer-col">
          <h4>קישורים שימושיים</h4>
          <ul className="footer-links">
             <li>
              <a href="/">עמוד הבית</a>
            </li>
            <li>
              <a href="/groups">הקבוצות</a>
            </li>
            <li>
              <a href="/user-guide">מדריך למשתמש</a>
            </li>
            <li>
              <a href="/about">אודות</a>
            </li>
          </ul>

          <div className="footer-social">
            <span className="footer-social-title">עקוב אחרינו</span>
            <div className="footer-social-icons">
              <a
                href="https://wa.me/972500000000"
                target="_blank"
                rel="noreferrer"
                aria-label="וואטסאפ"
              >
                <FaWhatsapp />
              </a>
              <a
                href="https://www.instagram.com/your_page"
                target="_blank"
                rel="noreferrer"
                aria-label="אינסטגרם"
              >
                <FaInstagram />
              </a>
              <a
                href="https://t.me/your_channel"
                target="_blank"
                rel="noreferrer"
                aria-label="טלגרם"
              >
                <FaTelegramPlane />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-col">
          <ContactForm />
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
