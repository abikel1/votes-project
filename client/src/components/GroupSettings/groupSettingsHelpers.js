// src/utils/groupSettingsHelpers.js

// מערך ריק Immutable לשימוש בסלקטורים
export const EMPTY_ARR = Object.freeze([]);

// יצירת slug יפה לשם קבוצה
export const makeSlug = (name = '') =>
  encodeURIComponent(
    String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-'),
  );

// המרה של תאריך ל-value של input[type="date"]
export function toLocalDateInputValue(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
      dt.getDate(),
    ).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

// חילוץ userId מבקשת הצטרפות, לפי כל מיני שמות שדות אפשריים
export function getReqUserId(r) {
  return (
    String(
      r.userId ??
        r.user_id ??
        r.applicantId ??
        r.applicant_id ??
        r.user?._id ??
        r.user?.id ??
        '',
    ) || null
  );
}

// הצגת שם מצביע בצורה "יפה" מתוך name/email
export const humanizeName = (raw, email) => {
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  if (!raw && email) {
    const local = String(email).split('@')[0] || '';
    const parts = local.split(/[._\-]+/).filter(Boolean);
    return parts.length ? parts.map(cap).join(' ') : local;
  }
  if (!raw) return '(ללא שם)';

  let s = String(raw).trim();

  if (/\s/.test(s)) {
    return s
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((w) => cap(w.toLowerCase()))
      .join(' ');
  }

  let parts = s.split(/[._\-]+/).filter(Boolean);

  if (parts.length === 1) {
    parts = s.split(/(?=[A-Z])/).filter(Boolean);
  }

  if (parts.length === 1 && email) {
    const local = String(email).split('@')[0] || '';
    const emailParts = local.split(/[._\-]+/).filter(Boolean);
    if (emailParts.length > 1) parts = emailParts;
  }

  return parts.map((p) => cap(p.toLowerCase())).join(' ') || s;
};

// ולידציה בסיסית לטופס מועמד/ת
export function validateCandidateFields({ name, description, symbol }) {
  const errors = {};

  const trimmedName = (name || '').trim();
  const trimmedDesc = (description || '').trim();
  const trimmedSymbol = (symbol || '').trim();

  if (!trimmedName) {
    errors.name = 'שם הוא שדה חובה';
  } else if (trimmedName.length < 2) {
    errors.name = 'השם צריך להיות לפחות באורך 2 תווים';
  } else if (trimmedName.length > 50) {
    errors.name = 'השם ארוך מדי (מקסימום 50 תווים)';
  }

  if (trimmedDesc && trimmedDesc.length > 500) {
    errors.description = 'התיאור ארוך מדי (מקסימום 500 תווים)';
  }

  if (trimmedSymbol && trimmedSymbol.length > 3) {
    errors.symbol = 'הסמל יכול להכיל עד 3 תווים';
  }

  return errors;
}
