import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    fetchGroupWithCandidates,
    fetchGroupMembers,
    addCandidateToGroup,
    removeCandidateFromGroup,
    addMemberToGroup,
    removeMemberFromGroup,
} from '../../slices/groupsSlice';
import { fetchUsers } from '../../slices/usersSlice';
import './GroupSettingsPage.css';

export default function GroupSettingsPage() {
    const { groupId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selectedGroup: group, candidates, members, loading, error } = useSelector(s => s.groups);
    const { userId, userName } = useSelector(s => s.auth);
    const { list: allUsers, loading: usersLoading } = useSelector(s => s.users);

    const [filter, setFilter] = useState('');

    useEffect(() => {
        dispatch(fetchGroupWithCandidates(groupId));
        dispatch(fetchGroupMembers(groupId));
        dispatch(fetchUsers());
    }, [dispatch, groupId]);

    const isOwner = useMemo(() => {
        if (!group) return false;
        if (typeof group.isOwner === 'boolean') return group.isOwner;
        const byId = group.createdById && userId && String(group.createdById) === String(userId);
        const byName = group.createdBy && userName &&
            String(group.createdBy).trim().toLowerCase() === String(userName).trim().toLowerCase();
        return !!(byId || byName);
    }, [group, userId, userName]);

    const candidateIds = new Set(candidates.map(c => String(c.user?._id || c.userId || c._id)));
    const memberIds = new Set(members.map(m => String(m.user?._id || m.userId || m._id)));

    const filteredUsers = useMemo(() => {
        const q = filter.trim().toLowerCase();
        let list = allUsers;
        if (q) list = allUsers.filter(u => (`${u.name || ''} ${u.email || ''}`).toLowerCase().includes(q));
        return list;
    }, [allUsers, filter]);

    if (loading) return <div className="gs-wrap"><h2>הגדרות קבוצה</h2><div>טוען...</div></div>;
    if (error) return <div className="gs-wrap"><h2>הגדרות קבוצה</h2><div className="err">{error}</div></div>;
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

    const addCandidate = (uid) => dispatch(addCandidateToGroup({ groupId, userId: uid }));
    const removeCandidate = (cid) => dispatch(removeCandidateFromGroup({ candidateId: cid }));
    const addMember = (uid) => dispatch(addMemberToGroup({ groupId, userId: uid }));
    const removeMember = (mid) => dispatch(removeMemberFromGroup({ groupId, memberId: mid }));

    return (
        <div className="gs-wrap">
            <div className="gs-header">
                <h2>הגדרות קבוצה</h2>
                <div className="gs-subtitle"><b>{group.name}</b> · מזהה: {group._id}</div>
                <div className="gs-actions">
                    <button className="gs-btn-outline" onClick={() => navigate(`/groups/${groupId}/candidates`)}>למסך המועמדים</button>
                    <button className="gs-btn" onClick={() => navigate('/groups')}>לרשימת הקבוצות</button>
                </div>
            </div>

            <div className="gs-grid">
                {/* מועמדים */}
                <section className="gs-card">
                    <h3>מועמדים</h3>
                    {!candidates?.length ? (
                        <div className="muted">אין מועמדים בקבוצה.</div>
                    ) : (
                        <ul className="list">
                            {candidates.map((c) => {
                                const id = String(c._id);
                                const uid = String(c.user?._id || c.userId || c._id);
                                const name = c.user?.name || c.name || c.user?.email || c.email || uid;
                                return (
                                    <li key={id} className="row">
                                        <div className="row-main">
                                            <div className="title">{name}</div>
                                            {c.user?.email && <div className="sub">{c.user.email}</div>}
                                        </div>
                                        <div className="row-actions">
                                            <button className="small danger" onClick={() => removeCandidate(id)}>הסר/י</button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* משתתפים */}
                <section className="gs-card">
                    <h3>משתתפים (חברי קבוצה)</h3>
                    {!members?.length ? (
                        <div className="muted">אין משתתפים עדיין.</div>
                    ) : (
                        <ul className="list">
                            {members.map((m) => {
                                const id = String(m._id);
                                const uid = String(m.user?._id || m.userId || m._id);
                                const name = m.user?.name || m.name || m.user?.email || m.email || uid;
                                return (
                                    <li key={id} className="row">
                                        <div className="row-main">
                                            <div className="title">{name}</div>
                                            {m.user?.email && <div className="sub">{m.user.email}</div>}
                                        </div>
                                        <div className="row-actions">
                                            <button className="small danger" onClick={() => removeMember(id)}>הסר/י</button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* הוספה */}
                <section className="gs-card">
                    <h3>הוספת משתמשים</h3>
                    <div className="field">
                        <label>חיפוש משתמשים</label>
                        <input className="input" placeholder="שם או אימייל..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                    </div>

                    {usersLoading ? (
                        <div>טוען משתמשים...</div>
                    ) : (
                        <ul className="list">
                            {filteredUsers.map(u => {
                                const uid = String(u._id);
                                const inCandidates = candidateIds.has(uid);
                                const inMembers = memberIds.has(uid);
                                return (
                                    <li key={uid} className="row">
                                        <div className="row-main">
                                            <div className="title">{u.name || u.email || uid}</div>
                                            {u.email && <div className="sub">{u.email}</div>}
                                        </div>
                                        <div className="row-actions">
                                            <button className="small" disabled={inCandidates} onClick={() => addCandidate(uid)}>
                                                הוסף/י מועמד/ת
                                            </button>
                                            <button className="small" disabled={inMembers} onClick={() => addMember(uid)}>
                                                הוסף/י משתתף/ת
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
