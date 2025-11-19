// client/src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // בכל פעם שהנתיב משתנה – קופצים לראש העמוד
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // אפשר גם: window.scrollTo(0, 0);
  }, [pathname]);

  return null; // לא מצייר כלום
}
