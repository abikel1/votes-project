// client/src/pages/CreateGroup/CreateGroupPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup, clearCreateState } from '../../slices/groupsSlice';
import { useNavigate } from 'react-router-dom';
import './CreateGroup.css';

export default function CreateGroupPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { createLoading, createError, justCreated } = useSelector((s) => s.groups);

    const [form, setForm] = useState({
        name: '',
        description: '',
        endDate: '',
        maxWinners: 1,
        shareLink: '',
        isLocked: null, // ← חובה לבחור (פתוחה/נעולה)
    });

    useEffect(() => {
        if (justCreated) {
            dispatch(clearCreateState());
            navigate('/groups');
        }
    }, [justCreated, dispatch, navigate]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'maxWinners' ? Number(value) : value,
        }));
    };

    const onChangeLock = (e) => {
        const v = e.target.value; // 'open' | 'locked'
        setForm((prev) => ({ ...prev, isLocked: v === 'locked' }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return alert('שם קבוצה חובה');
        if (!form.endDate) return alert('תאריך סיום חובה');
        if (form.isLocked === null) return alert('בחרי אם הקבוצה פתוחה או נעולה');

        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            maxWinners: Number(form.maxWinners) || 1,
            shareLink: form.shareLink?.trim() || undefined,
            isLocked: !!form.isLocked,                                  // ← boolean ודאי
            endDate: new Date(form.endDate).toISOString(),              // ← ISO
            // לא שולחים createdBy — השרת לוקח מ־req.user
        };

        // לוג נוח לבדיקה
        console.log('📦 Group payload to send:', payload);

        dispatch(createGroup(payload));
    };

    return (
        <div className="cg-wrap">
            <h2 className="cg-title">יצירת קבוצה חדשה</h2>

            <form className="cg-form" onSubmit={onSubmit}>
                <label className="cg-label">
                    שם קבוצה *
                    <input className="cg-input" name="name" value={form.name} onChange={onChange} required />
                </label>

                <label className="cg-label">
                    תיאור
                    <textarea className="cg-input" rows={3} name="description" value={form.description} onChange={onChange} />
                </label>

                <label className="cg-label">
                    תאריך סיום *
                    <input className="cg-input" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
                </label>

                <label className="cg-label">
                    מקסימום זוכים
                    <input className="cg-input" type="number" min={1} name="maxWinners" value={form.maxWinners} onChange={onChange} />
                </label>

                <fieldset className="cg-fieldset">
                    <legend className="cg-legend">מצב קבוצה *</legend>
                    <div className="cg-radio-row">
                        <label className="cg-radio">
                            <input
                                type="radio"
                                name="lockState"
                                value="open"
                                checked={form.isLocked === false}
                                onChange={onChangeLock}
                                required
                            />
                            פתוחה (הצטרפות חופשית)
                        </label>
                        <label className="cg-radio" style={{ marginInlineStart: 16 }}>
                            <input
                                type="radio"
                                name="lockState"
                                value="locked"
                                checked={form.isLocked === true}
                                onChange={onChangeLock}
                                required
                            />
                            🔒 נעולה (הצטרפות באישור מנהל/ת)
                        </label>
                    </div>
                </fieldset>

                <label className="cg-label">
                    קישור שיתוף (אופציונלי)
                    <input
                        className="cg-input"
                        type="url"
                        name="shareLink"
                        value={form.shareLink}
                        onChange={onChange}
                        placeholder="https://..."
                    />
                </label>

                {createError && <div className="cg-error">{createError}</div>}

                <div className="cg-actions">
                    <button className="cg-btn" type="submit" disabled={createLoading}>
                        {createLoading ? 'שומר…' : 'צור קבוצה'}
                    </button>
                    <button className="cg-btn-outline" type="button" onClick={() => navigate('/groups')}>
                        ביטול
                    </button>
                </div>
            </form>
        </div>
    );
}
