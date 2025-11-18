// client/src/pages/Join/JoinGroupPage.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../api/http';

const lc = (s) => (s || '').trim().toLowerCase();

export default function JoinGroupPage() {
  // במקום groupId מה־URL – אנחנו עובדים עם slug
  const { slug } = useParams();
  const navigate = useNavigate();

  // מזהה/ת התחברות גם לפי userEmail (למשל אחרי OAuth)
  const { userId, userEmail } = useSelector((s) => s.auth || {});

  const [groupName, setGroupName] = useState('');
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // מודאלים
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // הודעות
  const [error, setError] = useState('');
  const [hint, setHint] = useState(''); // הודעות ידידותיות (כבר חבר/ה, כבר יש בקשה וכו')

  // למניעת שליחה כפולה
  const postedOnceRef = useRef(false);

  // אם עוברים לקישור /join/slug אחר – מאפסים את הדגל
  useEffect(() => {
    postedOnceRef.current = false;
  }, [slug]);

  // טוען מידע על קבוצה לפי slug ומחזיר את האובייקט
  const loadGroupInfo = useCallback(async () => {
    try {
      const { data } = await http.get(`/groups/slug/${encodeURIComponent(slug)}`);
      setGroup(data || null);
      setGroupName(data?.name || '');
      setError('');
      return data;
    } catch (e) {
      const msg = e?.response?.data?.message || 'קבוצה לא נמצאה';
      setGroup(null);
      setGroupName('');
      setError(msg);
      return null;
    }
  }, [slug]);

  // שולח בקשת הצטרפות (למחוברים) – לפי groupId אמיתי מהשרת
  const sendJoinRequest = useCallback(async (groupIdFromServer) => {
    if (!groupIdFromServer) return;

    if (postedOnceRef.current) return; // אל תשגר פעמיים
    postedOnceRef.current = true;

    setLoading(true);
    setError('');
    setHint('');

    try {
      const { data } = await http.post(`/groups/${groupIdFromServer}/join`);
      // הצלחה רגילה
      setShowSuccess(true);
      // אם השרת מחזיר טקסט שימושי, אפשר לשמור ב-hint
      if (data?.message && typeof data.message === 'string') {
        setHint(data.message);
      }
    } catch (e) {
      const msg = String(
        e?.response?.data?.message || 'שליחת בקשת ההצטרפות נכשלה'
      );

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
  }, []);

  // זרימה ראשית
  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1) טוענים מידע על הקבוצה לפי slug
      const g = await loadGroupInfo();
      if (!g) {
        // קבוצה לא נמצאה / שגיאה – אין טעם להמשיך
        setLoading(false);
        return;
      }

      const realGroupId = g._id; // זה ה־ObjectId האמיתי של הקבוצה

      // 2) אם לא מחובר/ת – מבקשים להתחבר
      const loggedIn = !!(userId || userEmail);
      if (!loggedIn) {
        setShowLoginPrompt(true);
        setLoading(false);
        return;
      }

      // 3) בדיקת בעלות – אם זה המנהל, אין טעם בבקשה → ישר לעמוד הקבוצה
      const myEmailLc = lc(userEmail);
      const createdByEmailLc = lc(
        g.createdBy || g.created_by || g.ownerEmail || g.owner
      );

      const isOwnerByEmail =
        myEmailLc && createdByEmailLc && myEmailLc === createdByEmailLc;

      const isOwnerById =
        userId && g.createdById && String(userId) === String(g.createdById);

      const isOwner = !!(isOwnerByEmail || isOwnerById || g.isOwner);

      if (isOwner) {
        // ניווט לפי slug (שם הקבוצה ב־URL), לא לפי ID
        navigate(`/groups/${encodeURIComponent(slug)}`, { replace: true });
        setLoading(false);
        return;
      }

      // 4) בודקים מול השרת אם המשתמש כבר חבר בקבוצה (לפי ID אמיתי)
      try {
        const { data: mem } = await http.get(
          `/groups/${realGroupId}/my-membership`
        );
        if (mem?.member) {
          // כבר חבר/ה → הולכים ישר לעמוד הקבוצה
          navigate(`/groups/${encodeURIComponent(slug)}`, { replace: true });
          setLoading(false);
          return;
        }
      } catch (err) {
        // אם נכשל (401/403 וכו') לא עוצרים – פשוט נעבור למסלול בקשת הצטרפות
      }

      // 5) אם הגענו לכאן → לא מנהל/ת, לא חבר/ה → שולחים בקשת הצטרפות
      await sendJoinRequest(realGroupId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userEmail, loadGroupInfo, sendJoinRequest, slug, navigate]);

  const goLogin = () => {
    const redirect = encodeURIComponent(`/join/${encodeURIComponent(slug)}`);
    navigate(`/login?redirect=${redirect}`);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    // אחרי שליחה מוצלחת/עדכון מצב – אל רשימת הקבוצות
    navigate('/groups');
  };

  const cancelAndBack = () => {
    setShowLoginPrompt(false);
    // חזרה לעמוד הקבוצה (צפייה)
    navigate(`/groups/${encodeURIComponent(slug)}`);
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
            <div
              className="actions-row"
              style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}
            >
              <button
                className="gs-btn-outline"
                type="button"
                onClick={cancelAndBack}
              >
                ביטול
              </button>
              <button className="gs-btn" type="button" onClick={goLogin}>
                התחברות
              </button>
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
            <div
              className="actions-row"
              style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}
            >
              <button className="gs-btn" type="button" onClick={closeSuccess}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
