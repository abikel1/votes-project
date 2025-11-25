// src/DirectionWrapper.jsx
import { useTranslation } from 'react-i18next';

export default function DirectionWrapper({ children }) {
  const { i18n } = useTranslation();
  const dir = i18n.language === 'he' ? 'rtl' : 'ltr';

  return (
    <div className={`app-dir ${dir}`} dir={dir}>
      {children}
    </div>
  );
}
