import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchGroups } from '../../slices/groupsSlice';
import { requestJoinGroup } from '../../slices/joinRequestsSlice';
import './GroupsPage.css';

function formatDate(d) {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
        return d;
    }
}

// עוזר: הורדת אימייל לקייס אחיד
const lc = (s) => (s || '').trim().toLowerCase();

export default function GroupsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error: err, list: groups } = useSelector((s) => s.groups);

    // נשלוף גם מה־auth לרינדור מיידי
    const { userEmail: authEmail, userId: authId } = useSelector((s) => s.auth);

    useEffect(() => { dispatch(fetchGroups()); }, [dispatch]);

    if (loading) return <div className="loading-wrap">טוען קבוצות...</div>;
    if (err) return <div className="error">{err}</div>;
    if (!groups?.length) return <div className="empty">אין קבוצות עדיין.</div>;

    return (
        <div className="page-wrap">
            <h2 className="page-title">כל הקבוצות</h2>
            <div className="groups-grid">
                {groups.map((g) => {
                    const openCandidates = () => navigate(`/groups/${g._id}/candidates`);
                    const goSettings = (e) => { e.stopPropagation(); navigate(`/groups/${g._id}/settings`); };

                    const isLocked = !!g.isLocked;

                    // --- Fallback לבעלות כדי להציג ⚙️ מיידית גם אחרי רענון ---
                    const myEmail = lc(authEmail) || lc(localStorage.getItem('userEmail'));
                    const myId = String(authId ?? localStorage.getItem('userId') ?? '');

                    const createdByEmail = lc(g.createdBy ?? g.created_by ?? g.createdByEmail ?? g.ownerEmail ?? g.owner);
                    const createdById = String(g.createdById ?? '');

                    const fallbackOwner =
                        (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
                        (!!myId && !!createdById && myId === createdById);

                    const showGear = !!g.isOwner || fallbackOwner;

                    const onRequestJoin = (e) => {
                        e.stopPropagation();
                        dispatch(requestJoinGroup(g._id))
                            .unwrap()
                            .then(() => alert('הבקשה נשלחה'))
                            .catch((er) => alert(er));
                    };

                    return (
                        <article key={g._id} onClick={openCandidates} className="group-card">
                            <header className="card-header">
                                <h3 className="card-title">{g.name}</h3>

                                <div className="card-actions">
                                    <span className="badge">מקס׳ זוכים: <b>{g.maxWinners ?? 1}</b></span>
                                    {isLocked && <span className="chip">🔒 נעולה</span>}
                                    {showGear && (
                                        <button
                                            className="gear-btn"
                                            onClick={goSettings}
                                            title="הגדרות קבוצה"
                                            onMouseDown={(e) => e.preventDefault()}
                                        >⚙️</button>
                                    )}
                                </div>
                            </header>

                            {g.description && <p className="card-desc">{g.description}</p>}

                            <div className="meta-grid">
                                <div><small>נוצר:</small><b>{formatDate(g.creationDate)}</b></div>
                                <div><small>סיום:</small><b>{formatDate(g.endDate)}</b></div>
                            </div>

                            {isLocked && !showGear && (
                                <div className="actions" style={{ marginTop: 10 }}>
                                    <button className="btn" onClick={onRequestJoin}>בקש/י הצטרפות</button>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
