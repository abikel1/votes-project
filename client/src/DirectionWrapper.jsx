import { useEffect, useState } from 'react';
import i18n from './i18n';

const RTL_LANGS = new Set(['he', 'ar', 'fa', 'ur']);

function getBaseLang(lng) {
  return (lng || 'he').split('-')[0];
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

      document.documentElement.setAttribute('dir', nextDir);
      document.documentElement.setAttribute('lang', base);
      document.body.classList.toggle('rtl', nextDir === 'rtl');
      document.body.classList.toggle('ltr', nextDir === 'ltr');
    };

    apply(i18n.language);

    i18n.on('languageChanged', apply);
    return () => i18n.off('languageChanged', apply);
  }, []);

  return <div className={dir}>{children}</div>;
}
