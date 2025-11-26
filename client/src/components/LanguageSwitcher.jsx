import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // אופציונלי: לשמור ב-localStorage כדי לזכור
    localStorage.setItem('appLanguage', lng);
  };

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => changeLanguage('he')}
        style={{ fontWeight: i18n.language?.startsWith('he') ? 'bold' : 'normal' }}
      >
        עברית
      </button>
      <span>|</span>
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        style={{ fontWeight: i18n.language?.startsWith('en') ? 'bold' : 'normal' }}
      >
        EN
      </button>
    </div>
  );
}
