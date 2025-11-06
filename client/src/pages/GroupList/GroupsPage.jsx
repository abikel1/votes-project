import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchGroups } from '../../slices/groupsSlice';
import './GroupsPage.css';

function formatDate(d) {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
        return d;
    }
}

export default function GroupsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: groups, loading, error: err } = useSelector(s => s.groups);

    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    const copyShare = async (e, link) => { /* נשאר אותו דבר */ };
    const openShare = (e, link) => { /* נשאר אותו דבר */ };

    if (loading) return <div className="loading-wrap">טוען קבוצות...</div>;
    if (err) return <div className="error">{err}</div>;
    if (!groups.length) return <div className="empty">אין קבוצות עדיין.</div>;

    return (
        <div className="page-wrap">
            <h2 className="page-title">כל הקבוצות</h2>
            <div className="groups-grid">
                {groups.map((g) => {
                    const onOpen = () => navigate(`/groups/${g._id}/candidates`);
                    return (
                        <article key={g._id} onClick={onOpen} className="group-card">
                            <header className="card-header">
                                <h3 className="card-title">{g.name}</h3>
                                <span className="badge">מקס׳ זוכים: <b>{g.maxWinners ?? 1}</b></span>
                            </header>
                            <p className="card-desc">{g.description}</p>
                            <div className="meta-grid">
                                <div><small>נוצר:</small><b>{formatDate(g.creationDate)}</b></div>
                                <div><small>סיום:</small><b>{formatDate(g.endDate)}</b></div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
