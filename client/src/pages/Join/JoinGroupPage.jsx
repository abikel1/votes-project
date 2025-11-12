// client/src/pages/Join/JoinGroupPage.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../api/http';

export default function JoinGroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  // מזהה/ת התחברות גם לפי userEmail (למשל אחרי OAuth)
  const { userId, userEmail } = useSelector(s => s.auth || {});

  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);

  // מודאלים
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // הודעות
  const [error, setError] = useState('');
  const [hint, setHint] = useState(''); // הודעות ידידותיות (כבר חבר/ה, כבר יש בקשה וכו')

  // למניעת שליחה כפולה
  const postedOnceRef = useRef(false);

  // טוען שם קבוצה לתצוגה במודאל
  const loadGroupInfo = useCallback(async () => {
    try {
      const { data } = await http.get(`/groups/${groupId}`);
      setGroupName(data?.name || '');
    } catch (e) {
      setGroupName('');
      // אם לא קיימת קבוצה – אפשר להציג שגיאה ולהחזיר לרשימה
      setError(e?.response?.data?.message || 'קבוצה לא נמצאה');
    }
  }, [groupId]);

  // שולח בקשת הצטרפות (למחוברים)
  const sendJoinRequest = useCallback(async () => {
    if (postedOnceRef.current) return; // אל תשגר פעמיים
    postedOnceRef.current = true;

    setLoading(true);
    setError('');
    setHint('');

    try {
      const { data } = await http.post(`/groups/${groupId}/join`);
      // הצלחה רגילה
      setShowSuccess(true);
      // אם השרת מחזיר טקסט שימושי, אפשר לשמור ב-hint
      if (data?.message && typeof data.message === 'string') {
        setHint(data.message);
      }
    } catch (e) {
      const msg = String(e?.response?.data?.message || 'שליחת בקשת ההצטרפות נכשלה');

      // טיפול במקרים נפוצים – מציגים כהצלחה “רכה”
      if (/pending|already.*pending|exists/i.test(msg)) {
        setHint('כבר קיימת בקשת הצטרפות ממתינה לאישור.');
        setShowSuccess(true);
      } else if (/already.*member|כבר.*חבר/i.test(msg)) {
        setHint('את/ה כבר חבר/ה בקבוצה.');
        setShowSuccess(true);
      } else if (/not locked|Group is not locked|קבוצה.*פתוחה/i.test(msg)) {
        setHint('הקבוצה פתוחה — אין צורך בבקשת הצטרפות.');
        setShowSuccess(true);
      } else {
        // שגיאה אמיתית
        setError(msg);
        postedOnceRef.current = false; // אפשר לנסות שוב אם תרצי
      }
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // זרימה ראשית
  useEffect(() => {
    (async () => {
      await loadGroupInfo();

      // אם יש שגיאה בטעינת הקבוצה — עוצרים
      if (error) {
        setLoading(false);
        return;
      }

      // לא מחובר/ת? נבקש התחברות
      const loggedIn = !!(userId || userEmail);
      if (!loggedIn) {
        setShowLoginPrompt(true);
        setLoading(false);
        return;
      }

      // מחובר/ת → שולחים בקשה (פעם אחת)
      await sendJoinRequest();
    })();
    // שימי לב: לא נשים 'error' בתלות כדי לא ליצור לולאה, נבדוק אותו מיד אחרי הטעינה
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userEmail, loadGroupInfo, sendJoinRequest]);

  const goLogin = () => {
    const redirect = encodeURIComponent(`/join/${groupId}`);
    navigate(`/login?redirect=${redirect}`);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    // אחרי שליחה מוצלחת/עדכון מצב – אל רשימת הקבוצות
    navigate('/groups');
  };

  const cancelAndBack = () => {
    setShowLoginPrompt(false);
    // חזרה לעמוד הקבוצה (צפייה), או לרשימה
    navigate(`/groups/${groupId}`);
  };

  return (
    <div style={{ padding: 24 }}>
      {loading ? 'טוען…' : null}
      {error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}

      {/* מודאל: דרושה התחברות לפני בקשה */}
      {showLoginPrompt && (
        <div className="modal-backdrop" onClick={cancelAndBack}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>
              בקשת הצטרפות לקבוצה {groupName ? `“${groupName}”` : '(קבוצה נעולה)'}
            </h3>
            <div className="muted" style={{ marginBottom: 12 }}>
              כדי לבקש להצטרף לקבוצה נעולה יש להתחבר לחשבון.
            </div>
            <div className="actions-row" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="gs-btn-outline" type="button" onClick={cancelAndBack}>ביטול</button>
              <button className="gs-btn" type="button" onClick={goLogin}>התחברות</button>
            </div>
          </div>
        </div>
      )}

      {/* מודאל: הצלחה לאחר שליחת בקשה / מצבים “רכים” */}
      {showSuccess && (
        <div className="modal-backdrop" onClick={closeSuccess}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>הפניה בוצעה ✔</h3>
            <div className="muted" style={{ marginBottom: 12 }}>
              {hint || 'הבקשה נשלחה וממתינה לאישור מנהל/ת הקבוצה.'}
            </div>
            <div className="actions-row" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="gs-btn" type="button" onClick={closeSuccess}>סגור</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
