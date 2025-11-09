// client/src/components/GroupSettings/GroupSettingsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import {
    fetchGroupOnly,
    updateGroup,
    clearUpdateState,
} from '../../slices/groupsSlice';

import {
    fetchCandidatesByGroup,
    createCandidate,
    deleteCandidate,
    selectCandidatesForGroup,
    selectCandidatesLoadingForGroup,
    selectCandidatesErrorForGroup,
} from '../../slices/candidateSlice';

import './GroupSettingsPage.css';

function toLocalDateInputValue(d) {
    if (!d) return '';
    try {
        const dt = new Date(d);
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    } catch {
        return '';
    }
}

export default function GroupSettingsPage() {
    const { groupId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        selectedGroup: group,
        loading: groupLoading,
        error: groupError,
        updateLoading,
        updateError,
        updateSuccess,
    } = useSelector((s) => s.groups);

    const { userId, userName, userEmail } = useSelector((s) => s.auth);

    const candidates = useSelector(selectCandidatesForGroup(groupId));
    const candLoading = useSelector(selectCandidatesLoadingForGroup(groupId));
    const candError = useSelector(selectCandidatesErrorForGroup(groupId));

    const [form, setForm] = useState({
        name: '',
        description: '',
        symbol: '',
        photoUrl: '',
        maxWinners: 1,
        endDate: '',
    });
    const [editMode, setEditMode] = useState(false);

    const [candForm, setCandForm] = useState({
        name: '',
        description: '',
        symbol: '',
        photoUrl: '',
    });

    // טעינת נתונים
    useEffect(() => {
        dispatch(fetchGroupOnly(groupId));
        dispatch(fetchCandidatesByGroup(groupId));
    }, [dispatch, groupId]);

    // סנכרון טופס מפרטי הקבוצה
    useEffect(() => {
        if (group) {
            setForm({
                name: group.name || '',
                description: group.description || '',
                symbol: group.symbol || '',
                photoUrl: group.photoUrl || '',
                maxWinners: group.maxWinners ?? 1,
                endDate: toLocalDateInputValue(group.endDate),
            });
        }
    }, [group]);

    // ניקוי חיווי שמירה כשעוזבים מסך/נכנסים לעריכה
    useEffect(() => {
        return () => dispatch(clearUpdateState());
    }, [dispatch]);

    // הרשאת בעלות
    const isOwner = useMemo(() => {
        if (!group) return false;
        if (typeof group.isOwner === 'boolean') return group.isOwner;

        const byEmail =
            group?.createdBy &&
            userEmail &&
            String(group.createdBy).trim().toLowerCase() ===
            String(userEmail).trim().toLowerCase();

        const byId =
            group?.createdById &&
            userId &&
            String(group.createdById) === String(userId);

        const byName =
            group?.createdBy &&
            userName &&
            !String(group.createdBy).includes('@') &&
            String(group.createdBy).trim().toLowerCase() ===
            String(userName).trim().toLowerCase();

        return !!(byEmail || byId || byName);
    }, [group, userEmail, userId, userName]);

    if (groupLoading)
        return (
            <div className="gs-wrap">
                <h2>הגדרות קבוצה</h2>
                <div>טוען...</div>
            </div>
        );
    if (groupError)
        return (
            <div className="gs-wrap">
                <h2>הגדרות קבוצה</h2>
                <div className="err">{groupError}</div>
            </div>
        );
    if (!group)
        return (
            <div className="gs-wrap">
                <h2>הגדרות קבוצה</h2>
                <div>לא נמצאה קבוצה.</div>
            </div>
        );

    if (!isOwner) {
        return (
            <div className="gs-wrap">
                <h2>הגדרות קבוצה</h2>
                <div className="err">רק יוצר/ת הקבוצה יכול/ה לערוך את ההגדרות.</div>
                <button className="gs-btn" onClick={() => navigate(-1)}>
                    חזרה
                </button>
            </div>
        );
    }

    /* ===== Handlers ===== */

    const onGroupChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'maxWinners' ? Number(value) : value,
        }));
    };

    const onSaveGroup = async (e) => {
        e.preventDefault();
        // שולחים ל-thunk; הוא כבר מנקה שדות ריקים ושולח PUT
        const patch = {
            name: form.name.trim(),
            description: form.description.trim(),
            symbol: (form.symbol || '').trim(),
            photoUrl: (form.photoUrl || '').trim(),
            maxWinners: Number(form.maxWinners) || 1,
            ...(form.endDate ? { endDate: new Date(form.endDate).toISOString() } : {}),
        };
        await dispatch(updateGroup({ groupId, patch })).unwrap();
        setEditMode(false);
    };

    const onCancelEdit = () => {
        setEditMode(false);
        if (group) {
            setForm({
                name: group.name || '',
                description: group.description || '',
                symbol: group.symbol || '',
                photoUrl: group.photoUrl || '',
                maxWinners: group.maxWinners ?? 1,
                endDate: toLocalDateInputValue(group.endDate),
            });
        }
    };

    const onCandChange = (e) => {
        const { name, value } = e.target;
        setCandForm((prev) => ({ ...prev, [name]: value }));
    };

    const onAddCandidate = (e) => {
        e.preventDefault();
        if (!candForm.name.trim()) return alert('שם מועמד/ת חובה');
        dispatch(createCandidate({ groupId, ...candForm }))
            .unwrap()
            .then(() =>
                setCandForm({ name: '', description: '', symbol: '', photoUrl: '' })
            );
    };

    const onDelete = (cid) =>
        dispatch(deleteCandidate({ candidateId: cid, groupId }));

    /* ===== UI ===== */

    return (
        <div className="gs-wrap">
            <div className="gs-header">
                <h2>הגדרות קבוצה</h2>
                <div className="gs-subtitle">
                    <b>{group.name}</b> · מזהה: {group._id}
                </div>
                <div className="gs-actions">
                    <button className="gs-btn" onClick={() => navigate('/groups')}>
                        לרשימת הקבוצות
                    </button>
                </div>
            </div>

            <div className="layout">
                {/* פרטי קבוצה */}
                <section className="card">
                    <div className="card-head">
                        <h3>פרטי הקבוצה</h3>
                        {!editMode && (
                            <button className="gs-btn-outline" onClick={() => setEditMode(true)}>
                                עריכה
                            </button>
                        )}
                    </div>

                    {!editMode ? (
                        <div className="read-grid">
                            <div>
                                <small>שם</small>
                                <b>{group.name || '-'}</b>
                            </div>
                            <div>
                                <small>תיאור</small>
                                <div>{group.description || '-'}</div>
                            </div>
                            <div>
                                <small>מקס׳ זוכים</small>
                                <b>{group.maxWinners ?? 1}</b>
                            </div>
                            <div>
                                <small>תאריך סיום</small>
                                <b>
                                    {group.endDate
                                        ? new Date(group.endDate).toLocaleDateString('he-IL')
                                        : '-'}
                                </b>
                            </div>
                            {group.symbol ? (
                                <div>
                                    <small>סמל</small>
                                    <b>{group.symbol}</b>
                                </div>
                            ) : null}
                            {group.photoUrl ? (
                                <div>
                                    <small>תמונה</small>
                                    <a href={group.photoUrl} className="link" target="_blank" rel="noreferrer">
                                        פתיחה
                                    </a>
                                </div>
                            ) : null}
                            <div>
                                <small>נוצר ע״י</small>
                                <b>{group.createdBy || '-'}</b>
                            </div>

                            {updateError && <div className="err" style={{ marginTop: 6 }}>{updateError}</div>}
                            {updateSuccess && <div className="ok" style={{ marginTop: 6 }}>נשמר בהצלחה</div>}
                        </div>
                    ) : (
                        <form className="field" onSubmit={onSaveGroup}>
                            <label>שם *</label>
                            <input
                                className="input"
                                name="name"
                                required
                                value={form.name}
                                onChange={onGroupChange}
                            />

                            <label>תיאור</label>
                            <textarea
                                className="input"
                                rows={3}
                                name="description"
                                value={form.description}
                                onChange={onGroupChange}
                            />

                            <div className="grid-2">
                                <div>
                                    <label>מקס׳ זוכים</label>
                                    <input
                                        className="input"
                                        name="maxWinners"
                                        type="number"
                                        min={1}
                                        value={form.maxWinners}
                                        onChange={onGroupChange}
                                    />
                                </div>
                                <div>
                                    <label>תאריך סיום</label>
                                    <input
                                        className="input"
                                        name="endDate"
                                        type="date"
                                        value={form.endDate}
                                        onChange={onGroupChange}
                                    />
                                </div>
                            </div>

                            <label>סמל (אופציונלי)</label>
                            <input
                                className="input"
                                name="symbol"
                                value={form.symbol}
                                onChange={onGroupChange}
                                placeholder="למשל: א׳"
                            />

                            <label>קישור תמונה (אופציונלי)</label>
                            <input
                                className="input"
                                name="photoUrl"
                                type="url"
                                value={form.photoUrl}
                                onChange={onGroupChange}
                                placeholder="https://..."
                            />

                            {updateError ? (
                                <div className="err" style={{ marginTop: 6 }}>{updateError}</div>
                            ) : null}

                            <div className="actions-row">
                                <button className="gs-btn" type="submit" disabled={updateLoading}>
                                    שמור
                                </button>
                                <button
                                    className="gs-btn-outline"
                                    type="button"
                                    onClick={onCancelEdit}
                                    disabled={updateLoading}
                                >
                                    ביטול
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* סיידבר – אקורדיון מועמדים */}
                <aside className="sidebar">
                    <details open className="acc">
                        <summary className="acc-sum">מועמדים</summary>
                        <div className="acc-body">
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
                                                            {c.description || ''}
                                                            {c.photoUrl ? ` · ${c.photoUrl}` : ''}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="row-actions">
                                                    <button className="small danger" onClick={() => onDelete(id)}>
                                                        הסר/י
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </details>

                    <details className="acc">
                        <summary className="acc-sum">הוספת מועמד/ת</summary>
                        <div className="acc-body">
                            <form onSubmit={onAddCandidate} className="field">
                                <label>שם *</label>
                                <input
                                    className="input"
                                    name="name"
                                    value={candForm.name}
                                    onChange={onCandChange}
                                    required
                                />

                                <label>תיאור</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    name="description"
                                    value={candForm.description}
                                    onChange={onCandChange}
                                />

                                <label>סמל (אופציונלי)</label>
                                <input
                                    className="input"
                                    name="symbol"
                                    value={candForm.symbol}
                                    onChange={onCandChange}
                                    placeholder="למשל: א׳"
                                />

                                <label>קישור תמונה (אופציונלי)</label>
                                <input
                                    className="input"
                                    name="photoUrl"
                                    type="url"
                                    value={candForm.photoUrl}
                                    onChange={onCandChange}
                                    placeholder="https://..."
                                />

                                <div style={{ marginTop: 8 }}>
                                    <button className="gs-btn" type="submit">
                                        הוסף/י מועמד/ת
                                    </button>
                                </div>
                            </form>
                        </div>
                    </details>
                </aside>
            </div>
        </div>
    );
}
