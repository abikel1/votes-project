// src/pages/Contact/ContactPage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMail } from '../../slices/mailSlice';
import toast from 'react-hot-toast';
import '../ContactForm/ContactForm.css';
import { useTranslation } from 'react-i18next';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'my-contact@example.com';

export default function ContactPage() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.mail);
  const { t } = useTranslation();

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
    if (!form.fullName.trim()) errors.fullName = t('contact.errors.fullNameRequired');
    if (!form.fromEmail.trim()) {
      errors.fromEmail = t('contact.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fromEmail.trim())) {
      errors.fromEmail = t('contact.errors.emailInvalid');
    }
    if (!form.message.trim()) errors.message = t('contact.errors.messageRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSent(false);
    if (!validate()) return;

    try {
      await dispatch(
        sendMail({
          to: CONTACT_EMAIL,
          subject: t('contact.mailSubject', { name: form.fullName.trim() }),
          replyTo: form.fromEmail.trim(), // ✅ הכי חשוב
          text: `
${t('contact.mailText.nameLabel')}: ${form.fullName || '-'}
${t('contact.mailText.emailLabel')}: ${form.fromEmail || '-'}
${t('contact.mailText.phoneLabel')}: ${form.phone || '-'}
${t('contact.mailText.messageLabel')}: ${form.message || '-'}
          `.trim(),
        })
      ).unwrap();

      toast.success(t('contact.toast.success'));
      setForm({ fullName: '', fromEmail: '', phone: '', message: '' });
      setSent(true);
    } catch {
      toast.error(t('contact.toast.error'));
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-card">
        <h2 className="contact-title">{t('contact.title')}</h2>
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>{t('contact.fullNameLabel')} *</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              className={fieldErrors.fullName ? 'error' : ''}
              placeholder={t('contact.fullNamePlaceholder')}
            />
            {fieldErrors.fullName && (
              <span className="error-text">{fieldErrors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label>{t('contact.emailLabel')} *</label>
            <input
              type="email"
              name="fromEmail"
              value={form.fromEmail}
              onChange={onChange}
              className={fieldErrors.fromEmail ? 'error' : ''}
              placeholder={t('contact.emailPlaceholder')}
            />
            {fieldErrors.fromEmail && (
              <span className="error-text">{fieldErrors.fromEmail}</span>
            )}
          </div>

          <div className="form-group">
            <label>{t('contact.phoneLabel')}</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              className={fieldErrors.phone ? 'error' : ''}
              placeholder={t('contact.phonePlaceholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('contact.messageLabel')} *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              className={fieldErrors.message ? 'error' : ''}
              rows={4}
              placeholder={t('contact.messagePlaceholder')}
            />
            {fieldErrors.message && (
              <span className="error-text">{fieldErrors.message}</span>
            )}
          </div>

          <button className="btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading'
              ? t('contact.button.loading')
              : t('contact.button.submit')}
          </button>

          {sent && (
            <div className="success-text">
              {t('contact.successText')}
            </div>
          )}

          {error && <div className="error-text">{error}</div>}
        </form>
      </div>
    </div>
  );
}
