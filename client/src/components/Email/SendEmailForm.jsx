import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMail } from '../../slices/mailSlice';

export default function SendEmailForm() {
  const dispatch = useDispatch();
  const { status, error, lastResponse } = useSelector(s => s.mail);

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [html, setHtml] = useState('');
  const [template, setTemplate] = useState(''); // לדוגמה: "resetPassword"
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
      <h2>שליחת מייל</h2>
      <form onSubmit={onSubmit}>
        <input type="email" placeholder="נמען (to)" value={to} onChange={e=>setTo(e.target.value)} required />
        <input type="text" placeholder="נושא (subject)" value={subject} onChange={e=>setSubject(e.target.value)} required />
        <textarea placeholder="טקסט (text)" value={text} onChange={e=>setText(e.target.value)} />
        <textarea placeholder="HTML (optional)" value={html} onChange={e=>setHtml(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <label>Template (אופציונלי): </label>
          <input type="text" placeholder="למשל resetPassword" value={template} onChange={e=>setTemplate(e.target.value)} />
        </div>
        {template && (
          <textarea
            value={varsJson}
            onChange={e=>setVarsJson(e.target.value)}
            placeholder='Vars JSON (למשל {"link":"https://..."})'
          />
        )}
        <button disabled={status==='loading'}>שליחה</button>
      </form>

      {status==='succeeded' && lastResponse && (
        <div style={{ marginTop: 12 }}>
          <p>נשלח ✓</p>
          {lastResponse.previewUrl && (
            <p>
              (Ethereal) <a href={lastResponse.previewUrl} target="_blank" rel="noreferrer">פתח תצוגה מקדימה</a>
            </p>
          )}
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
