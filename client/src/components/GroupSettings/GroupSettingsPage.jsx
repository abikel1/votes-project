// client/src/components/GroupSettings/GroupSettingsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchGroupOnly } from '../../slices/groupsSlice';
import {
    fetchCandidatesByGroup,
    createCandidate,
    deleteCandidate,
    selectCandidatesForGroup,
    selectCandidatesLoadingForGroup,
    selectCandidatesErrorForGroup,
} from '../../slices/candidateSlice';
import './GroupSettingsPage.css';

export default function GroupSettingsPage() {
    const { groupId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selectedGroup: group, loading: groupLoading, error: groupError } = useSelector(s => s.groups);
    const { userId, userName, userEmail } = useSelector(s => s.auth);

    const candidates = useSelector(selectCandidatesForGroup(groupId));
    const candLoading = useSelector(selectCandidatesLoadingForGroup(groupId));
    const candError = useSelector(selectCandidatesErrorForGroup(groupId));

    const [form, setForm] = useState({ name: '', description: '', symbol: '', photoUrl: '' });

    useEffect(() => {
        dispatch(fetchGroupOnly(groupId));
        dispatch(fetchCandidatesByGroup(groupId));
    }, [dispatch, groupId]);

    const isOwner = useMemo(() => {
        if (!group) return false;
        if (typeof group.isOwner === 'boolean') return group.isOwner;

        const byEmail =
            group?.createdBy && userEmail &&
            String(group.createdBy).trim().toLowerCase() === String(userEmail).trim().toLowerCase();

        const byId = group?.createdById && userId && String(group.createdById) === String(userId);

        const byName =
            group?.createdBy && userName &&
            !String(group.createdBy).includes('@') &&
            String(group.createdBy).trim().toLowerCase() === String(userName).trim().toLowerCase();

        return !!(byEmail || byId || byName);
    }, [group, userEmail, userId, userName]);

    if (groupLoading) return <div className="gs-wrap"><h2>הגדרות קבוצה</h2><div>טוען...</div></div>;
    if (groupError) return <div className="gs-wrap"><h2>הגדרות קבוצה</h2><div className="err">{groupError}</div></div>;
    if (!group) return <div className="gs-wrap"><h2>הגדרות קבוצה</h2><div>לא נמצאה קבוצה.</div></div>;

    if (!isOwner) {
        return (
            <div className="gs-wrap">
                <h2>הגדרות קבוצה</h2>
                <div className="err">רק יוצר/ת הקבוצה יכול/ה לערוך את ההגדרות.</div>
                <button className="gs-btn" onClick={() => navigate(-1)}>חזרה</button>
            </div>
        );
    }

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const onAdd = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return alert('שם מועמד/ת חובה');
        dispatch(createCandidate({ groupId, ...form }))
            .unwrap()
            .then(() => setForm({ name: '', description: '', symbol: '', photoUrl: '' }));
    };

    const onDelete = (cid) => dispatch(deleteCandidate({ candidateId: cid, groupId }));

    return (
        <div className="gs-wrap">
            <div className="gs-header">
                <h2>הגדרות קבוצה</h2>
                <div className="gs-subtitle"><b>{group.name}</b> · מזהה: {group._id}</div>
                <div className="gs-actions">
                    <button className="gs-btn" onClick={() => navigate('/groups')}>לרשימת הקבוצות</button>
                </div>
            </div>

            <div className="gs-grid">
                <section className="gs-card">
                    <h3>מועמדים</h3>
                    {candLoading ? (
                        <div>טוען מועמדים…</div>
                    ) : candError ? (
                        <div className="err">{candError}</div>
                    ) : !candidates?.length ? (
                        <div className="muted">אין מועמדים בקבוצה.</div>
                    ) : (
                        <ul className="list">
                            {candidates.map((c) => {
                                const id = String(c._id);
                                return (
                                    <li key={id} className="row">
                                        <div className="row-main">
                                            <div className="title">
                                                {c.name || '(ללא שם)'} {c.symbol ? `· ${c.symbol}` : ''}
                                            </div>
                                            {(c.description || c.photoUrl) && (
                                                <div className="sub">
                                                    {c.description || ''}{c.photoUrl ? ` · ${c.photoUrl}` : ''}
                                                </div>
                                            )}
                                        </div>
                                        <div className="row-actions">
                                            <button className="small danger" onClick={() => onDelete(id)}>הסר/י</button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className="gs-card">
                    <h3>הוספת מועמד/ת</h3>
                    <form onSubmit={onAdd} className="field">
                        <label>שם *</label>
                        <input className="input" name="name" value={form.name} onChange={onChange} required />

                        <label>תיאור</label>
                        <textarea className="input" rows={3} name="description" value={form.description} onChange={onChange} />

                        <label>סמל (אופציונלי)</label>
                        <input className="input" name="symbol" value={form.symbol} onChange={onChange} placeholder="למשל: א'" />

                        <label>קישור תמונה (אופציונלי)</label>
                        <input className="input" name="photoUrl" type="url" value={form.photoUrl} onChange={onChange} placeholder="https://..." />

                        <div style={{ marginTop: 8 }}>
                            <button className="gs-btn" type="submit">הוסף/י מועמד/ת</button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
