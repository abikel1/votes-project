import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMail } from '../../slices/mailSlice';
import { useTranslation } from 'react-i18next';

export default function SendEmailForm() {
  const dispatch = useDispatch();
  const { status, error, lastResponse } = useSelector(s => s.mail);
  const { t } = useTranslation();

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [html, setHtml] = useState('');
  const [template, setTemplate] = useState('');
  const [varsJson, setVarsJson] = useState('{"link": "https://example.com"}');

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
      template: template || undefined,
      vars: template ? JSON.parse(varsJson || '{}') : undefined,
    };
    dispatch(sendMail(payload));
  };

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto' }}>
      <h2>{t('mail.sendTitle')}</h2>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder={t('mail.toPlaceholder')}
          value={to}
          onChange={e => setTo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder={t('mail.subjectPlaceholder')}
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        />
        <textarea
          placeholder={t('mail.textPlaceholder')}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <textarea
          placeholder={t('mail.htmlPlaceholder')}
          value={html}
          onChange={e => setHtml(e.target.value)}
        />
        <div style={{ marginTop: 8 }}>
          <label>{t('mail.templateLabel')}: </label>
          <input
            type="text"
            placeholder={t('mail.templatePlaceholder')}
            value={template}
            onChange={e => setTemplate(e.target.value)}
          />
        </div>
        {template && (
          <textarea
            value={varsJson}
            onChange={e => setVarsJson(e.target.value)}
            placeholder={t('mail.varsJsonPlaceholder')}
          />
        )}
        <button disabled={status === 'loading'}>
          {t('mail.sendButton')}
        </button>
      </form>

      {status === 'succeeded' && lastResponse && (
        <div style={{ marginTop: 12 }}>
          <p>{t('mail.sentOk')}</p>
          {lastResponse.previewUrl && (
            <p>
              {t('mail.etherealNote')}{' '}
              <a href={lastResponse.previewUrl} target="_blank" rel="noreferrer">
                {t('mail.previewLink')}
              </a>
            </p>
          )}
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
