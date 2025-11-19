// src/pages/Contact/ContactPage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMail } from '../../slices/mailSlice';
import toast from 'react-hot-toast';
import '../ContactForm/ContactForm.css';
// C:\Users\מוריה פרובר\Desktop\הכשרה הדסים\votes-project\client\src\pages\ContactForm\ContactForm.css
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'my-contact@example.com';

export default function ContactPage() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.mail);

  const [form, setForm] = useState({
    fullName: '',
    fromEmail: '',
    phone: '',
    message: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'נא למלא שם מלא';
    if (!form.fromEmail.trim()) {
      errors.fromEmail = 'נא למלא אימייל';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fromEmail.trim())) {
      errors.fromEmail = 'פורמט אימייל אינו תקין';
    }
    if (!form.message.trim()) errors.message = 'נא לכתוב הודעה';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSent(false);
    if (!validate()) return;

    try {
      await dispatch(
        sendMail({
          to: CONTACT_EMAIL,
          subject: `פנייה חדשה מהאתר – ${form.fullName.trim()}`,
          text: `
שם: ${form.fullName || '-'}
דוא"ל: ${form.fromEmail || '-'}
טלפון: ${form.phone || '-'}
הודעה: ${form.message || '-'}
          `.trim(),
        })
      ).unwrap();

      toast.success('ההודעה נשלחה בהצלחה!');
      setForm({ fullName: '', fromEmail: '', phone: '', message: '' });
      setSent(true);
    } catch {
      toast.error('אירעה שגיאה בשליחה, נסו שוב');
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-card">
        <h2 className="contact-title">צור קשר</h2>
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>שם מלא *</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              className={fieldErrors.fullName ? 'error' : ''}
              placeholder="איך לפנות אלייך?"
            />
            {fieldErrors.fullName && <span className="error-text">{fieldErrors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>אימייל לחזרה *</label>
            <input
              type="email"
              name="fromEmail"
              value={form.fromEmail}
              onChange={onChange}
              className={fieldErrors.fromEmail ? 'error' : ''}
              placeholder="name@example.com"
            />
            {fieldErrors.fromEmail && <span className="error-text">{fieldErrors.fromEmail}</span>}
          </div>

          <div className="form-group">
            <label>טלפון (אופציונלי)</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              className={fieldErrors.phone ? 'error' : ''}
              placeholder="050-0000000"
            />
          </div>

          <div className="form-group">
            <label>הודעה *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              className={fieldErrors.message ? 'error' : ''}
              rows={4}
              placeholder="איך אפשר לעזור?"
            />
            {fieldErrors.message && <span className="error-text">{fieldErrors.message}</span>}
          </div>

          <button className="btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'שולח/ת…' : 'שלח/י הודעה'}
          </button>

          {sent && <div className="success-text">ההודעה נשלחה, נחזור אלייך בהקדם 🙂</div>}
          {error && <div className="error-text">{error}</div>}
        </form>
      </div>
    </div>
  );
}
