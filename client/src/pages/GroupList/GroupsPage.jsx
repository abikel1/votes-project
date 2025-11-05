import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from "../../api/http"; import './GroupsPage.css';                   // ← CSS שיצרת באותה תיקייה

function formatDate(d) {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
        return d;
    }
}

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await http.get('/groups'); // => /api/groups
                setGroups(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error('Error loading groups:', e);
                setErr(e?.response?.data?.message || `Failed to load groups (${e?.message || ''})`);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const copyShare = async (e, link) => {
        e.stopPropagation();
        if (!link) return;
        try {
            await navigator.clipboard.writeText(link);
            alert('קישור הועתק ✔️');
        } catch {
            alert('לא הצלחתי להעתיק 😕');
        }
    };

    const openShare = (e, link) => {
        e.stopPropagation();
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className="loading-wrap">
                <h2 className="loading-title">כל הקבוצות</h2>
                <div className="skeleton-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton-card" />
                    ))}
                </div>
            </div>
        );
    }

    if (err) return <div className="error">{err}</div>;
    if (!groups.length) return <div className="empty">אין עדיין קבוצות.</div>;

    return (
        <div className="page-wrap">
            <h2 className="page-title">כל הקבוצות</h2>

            <div className="groups-grid">
                {groups.map((g) => {
                    const onOpen = () => navigate(`/groups/${g._id}/candidates`);
                    const onKey = (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpen();
                        }
                    };

                    return (
                        <article
                            key={g._id}
                            role="button"
                            tabIndex={0}
                            onClick={onOpen}
                            onKeyDown={onKey}
                            className="group-card"
                            aria-label={`פתח קבוצה ${g.name || ''}`}
                        >
                            <header className="card-header">
                                <h3 className="card-title">{g.name || 'ללא שם'}</h3>
                                <span className="badge">
                                    מקס׳ זוכים: <b>{g.maxWinners ?? 1}</b>
                                </span>
                            </header>

                            {g.description && <p className="card-desc">{g.description}</p>}

                            <div className="meta-row">
                                <span>
                                    יוצר/ת: <b>{g.createdBy || '-'}</b>
                                </span>
                            </div>

                            <div className="meta-grid">
                                <div>
                                    <small>נוצר:</small>
                                    <div>
                                        <b>{formatDate(g.creationDate)}</b>
                                    </div>
                                </div>
                                <div>
                                    <small>סיום:</small>
                                    <div>
                                        <b>{formatDate(g.endDate)}</b>
                                    </div>
                                </div>
                            </div>

                            <div className="chips-row">
                                <span className="chip">מועמדים: {g.candidates?.length ?? 0}</span>
                                <span className="chip">משתתפים: {g.participants?.length ?? 0}</span>
                                <span className="chip">קולות: {g.votes?.length ?? 0}</span>
                            </div>

                            {g.shareLink && (
                                <div className="actions">
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        onClick={(e) => openShare(e, g.shareLink)}
                                        aria-label="פתיחת קישור שיתוף"
                                    >
                                        פתיחת קישור
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={(e) => copyShare(e, g.shareLink)}
                                        aria-label="העתקת קישור שיתוף"
                                    >
                                        העתק קישור
                                    </button>
                                </div>
                            )}

                            <footer className="hint">הקלק/י כדי לראות את המועמדים של הקבוצה</footer>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
