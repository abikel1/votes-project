// client/src/pages/GroupsList/GroupsPage.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchGroups, selectGroupsWithOwnership } from '../../slices/groupsSlice';
import './GroupsPage.css';

function formatDate(d) {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
        return d;
    }
}

// הדלקת דיבוג זמני (אפשר לכבות אח"כ)
const DEBUG_MODE = true;

export default function GroupsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error: err, list } = useSelector((s) => s.groups);
    const groups = useSelector(selectGroupsWithOwnership);

    // חשוב: נקבל את האימייל ישירות מה־auth לצורך בדיקה מקומית
    const meEmail = useSelector((s) => s.auth.userEmail);

    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    if (loading) return <div className="loading-wrap">טוען קבוצות...</div>;
    if (err) return <div className="error">{err}</div>;
    if (!groups?.length) return <div className="empty">אין קבוצות עדיין.</div>;

    return (
        <div className="page-wrap">
            <h2 className="page-title">כל הקבוצות</h2>
            <div className="groups-grid">
                {groups.map((g) => {
                    const openGroup = () => navigate(`/groups/${g._id}`);

                    // const openCandidates = () => navigate(`/groups/${g._id}/candidates`);
                    const goSettings = (e) => { e.stopPropagation(); navigate(`/groups/${g._id}/settings`); };

                    // ✅ בדיקה מקומית (עוקפת סלקטור) – מראה אם יש התאמה לפי אימייל
                    const createdByEmail = String(
                        g.createdBy ?? g.created_by ?? g.createdByEmail ?? g.ownerEmail ?? g.owner ?? ''
                    ).trim().toLowerCase();
                    const myEmailLc = String(meEmail || '').trim().toLowerCase();
                    const emailMatchLocal = !!(createdByEmail && myEmailLc && createdByEmail === myEmailLc);

                    // מה יוצג בפועל (אם תרצי לחזור לסלקטור – החליפי ל-g.isOwner)
                    const showGear = emailMatchLocal; // ← כרגע נשתמש בבדיקה המקומית

                    return (
                        <article key={g._id} onClick={openGroup} className="group-card">
                            <header className="card-header">
                                <h3 className="card-title">{g.name}</h3>

                                <div className="card-actions">
                                    <span className="badge">
                                        מקס׳ זוכים: <b>{g.maxWinners ?? 1}</b>
                                    </span>

                                    {showGear && (
                                        <button
                                            className="gear-btn"
                                            onClick={goSettings}
                                            title="הגדרות קבוצה"
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            ⚙️
                                        </button>
                                    )}
                                </div>
                            </header>
                            {g.description && <p className="card-desc">{g.description}</p>}

                            <div className="meta-grid">
                                <div>
                                    <small>נוצר:</small>
                                    <b>{formatDate(g.creationDate)}</b>
                                </div>
                                <div>
                                    <small>סיום:</small>
                                    <b>{formatDate(g.endDate)}</b>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
