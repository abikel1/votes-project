import { useEffect, useState } from 'react';
import i18n from './i18n';

const RTL_LANGS = new Set(['he', 'ar', 'fa', 'ur']);

function getBaseLang(lng) {
  return (lng || 'he').split('-')[0]; // he-IL -> he
}

export default function DirectionWrapper({ children }) {
  const [dir, setDir] = useState(() => {
    const base = getBaseLang(i18n.language);
    return RTL_LANGS.has(base) ? 'rtl' : 'ltr';
  });

  useEffect(() => {
    const apply = (lng) => {
      const base = getBaseLang(lng);
      const nextDir = RTL_LANGS.has(base) ? 'rtl' : 'ltr';

      setDir(nextDir);

      // הכי חשוב: זה קובע RTL/LTR לכל האתר
      document.documentElement.setAttribute('dir', nextDir);
      document.documentElement.setAttribute('lang', base);

      // אופציונלי: קלאסים לשימוש ב-CSS אם בא לך
      document.body.classList.toggle('rtl', nextDir === 'rtl');
      document.body.classList.toggle('ltr', nextDir === 'ltr');
    };

    apply(i18n.language);

    // מאזין לשינוי שפה
    i18n.on('languageChanged', apply);
    return () => i18n.off('languageChanged', apply);
  }, []);

  // אופציונלי: גם עוטף ב-div כדי שיהיה לך hook ל-CSS אם צריך
  return <div className={dir}>{children}</div>;
}
