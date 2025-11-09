import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import {
  fetchGroupWithMembers,
  updateGroup,
  clearUpdateState,
  selectSelectedGroupMembersEnriched,
} from '../../slices/groupsSlice';

import {
  fetchCandidatesByGroup,
  createCandidate,
  deleteCandidate,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup,
} from '../../slices/candidateSlice';

import {
  fetchJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  selectJoinRequestsForGroup,
  selectJoinRequestsLoading,
  selectJoinRequestsError
} from '../../slices/joinRequestsSlice';

import { upsertUsers } from '../../slices/usersSlice';
import './GroupSettingsPage.css';

const EMPTY_ARR = Object.freeze([]);

function toLocalDateInputValue(d) {
  if (!d) return '';
  try { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; }
  catch { return ''; }
}

// חילוץ userId ממבני בקשה שונים
function getReqUserId(r) {
  return String(
    r.userId ?? r.user_id ?? r.applicantId ?? r.applicant_id ?? r.user?._id ?? r.user?.id ?? ''
  ) || null;
}

// מציג מירב הפרטים שקיימים למשתתף
function MemberRow({ m }) {
  const phone = m.phone || m.phoneNumber || m.mobile || m.mobilePhone;
  const role = m.role || m.roleName || m.type;
  const created = m.createdAt ? new Date(m.createdAt).toLocaleDateString('he-IL') : null;
  const joined = m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('he-IL') : null;
  return (
    <li className="row">
      <div className="row-main">
        <div className="title">{m.name || m.email || m._id || '(ללא שם)'}</div>
        <div className="sub">
          {m.email ? `${m.email}` : ''}
          {phone ? ` · ${phone}` : ''}
          {role ? ` · ${role}` : ''}
          {created ? ` · נוצר: ${created}` : ''}
          {joined ? ` · הצטרף: ${joined}` : ''}
        </div>
      </div>
    </li>
  );
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

  const enrichedMembers = useSelector(selectSelectedGroupMembersEnriched);

  const { userId, userName, userEmail } = useSelector((s) => s.auth);

  const candidates = useSelector(selectCandidatesForGroup(groupId)) || EMPTY_ARR;
  const candLoading = useSelector(selectCandidatesLoadingForGroup(groupId));
  const candError = useSelector(selectCandidatesErrorForGroup(groupId));

  const reqs = useSelector(selectJoinRequestsForGroup(groupId)) || EMPTY_ARR;
  const reqsLoading = useSelector(selectJoinRequestsLoading(groupId));
  const reqsError = useSelector(selectJoinRequestsError(groupId));

  const [form, setForm] = useState({
    name: '', description: '', symbol: '', photoUrl: '', maxWinners: 1, endDate: '', isLocked: false,
  });
  const [editMode, setEditMode] = useState(false);

  const [candForm, setCandForm] = useState({ name: '', description: '', symbol: '', photoUrl: '' });

  // טעינה
  useEffect(() => { dispatch(fetchGroupWithMembers(groupId)); dispatch(fetchCandidatesByGroup(groupId)); }, [dispatch, groupId]);
  useEffect(() => { if (group?.isLocked) dispatch(fetchJoinRequests(groupId)); }, [dispatch, groupId, group?.isLocked]);
  useEffect(() => () => dispatch(clearUpdateState()), [dispatch]);

  useEffect(() => {
    if (group) {
      setForm({
        name: group.name || '',
        description: group.description || '',
        symbol: group.symbol || '',
        photoUrl: group.photoUrl || '',
        maxWinners: group.maxWinners ?? 1,
        endDate: toLocalDateInputValue(group.endDate),
        isLocked: !!group.isLocked,
      });
    }
  }, [group]);

  const isOwner = useMemo(() => {
    if (!group) return false;
    if (typeof group.isOwner === 'boolean') return group.isOwner;

    const byEmail = group?.createdBy && userEmail &&
      String(group.createdBy).trim().toLowerCase() === String(userEmail).trim().toLowerCase();

    const byId = group?.createdById && userId && String(group.createdById) === String(userId);

    const byName = group?.createdBy && userName && !String(group.createdBy).includes('@') &&
      String(group.createdBy).trim().toLowerCase() === String(userName).trim().toLowerCase();

    return !!(byEmail || byId || byName);
  }, [group, userEmail, userId, userName]);

  if (groupLoading) return (<div className="gs-wrap"><h2>הגדרות קבוצה</h2><div>טוען...</div></div>);
  if (groupError) return (<div className="gs-wrap"><h2>הגדרות קבוצה</h2><div className="err">{groupError}</div></div>);
  if (!group) return (<div className="gs-wrap"><h2>הגדרות קבוצה</h2><div>לא נמצאה קבוצה.</div></div>);
  if (!isOwner) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div className="err">רק יוצר/ת הקבוצה יכול/ה לערוך את ההגדרות.</div>
        <button className="gs-btn" onClick={() => navigate(-1)}>חזרה</button>
      </div>
    );
  }

  const onGroupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'maxWinners' ? Number(value) : (type === 'checkbox' ? checked : value) }));
  };

  const onSaveGroup = async (e) => {
    e.preventDefault();
    const patch = {
      name: form.name.trim(),
      description: form.description.trim(),
      symbol: (form.symbol || '').trim(),
      photoUrl: (form.photoUrl || '').trim(),
      maxWinners: Number(form.maxWinners) || 1,
      isLocked: !!form.isLocked,
      ...(form.endDate ? { endDate: new Date(form.endDate).toISOString() } : {}),
    };
    await dispatch(updateGroup({ groupId, patch })).unwrap();
    setEditMode(false);
    if (patch.isLocked) dispatch(fetchJoinRequests(groupId));
    dispatch(fetchGroupWithMembers(groupId));
  };

  const onCancelEdit = () => {
    setEditMode(false);
    if (group) {
      setForm({
        name: group.name || '', description: group.description || '', symbol: group.symbol || '',
        photoUrl: group.photoUrl || '', maxWinners: group.maxWinners ?? 1,
        endDate: toLocalDateInputValue(group.endDate), isLocked: !!group.isLocked,
      });
    }
  };

  const onCandChange = (e) => { const { name, value } = e.target; setCandForm(prev => ({ ...prev, [name]: value })); };
  const onAddCandidate = (e) => {
    e.preventDefault();
    if (!candForm.name.trim()) return alert('שם מועמד/ת חובה');
    dispatch(createCandidate({ groupId, ...candForm }))
      .unwrap()
      .then(() => setCandForm({ name: '', description: '', symbol: '', photoUrl: '' }));
  };
  const onDelete = (cid) => dispatch(deleteCandidate({ candidateId: cid, groupId }));

  return (
    <div className="gs-wrap">
      <div className="gs-header">
        <h2>הגדרות קבוצה</h2>
        <div className="gs-subtitle"><b>{group.name}</b> · מזהה: {group._id}</div>
        <div className="gs-actions"><button className="gs-btn" onClick={() => navigate('/groups')}>לרשימת הקבוצות</button></div>
      </div>

      <div className="layout">

        {/* פרטי קבוצה */}
        <section className="card">
          <div className="card-head">
            <h3>פרטי הקבוצה</h3>
            {!editMode && (<button className="gs-btn-outline" onClick={() => setEditMode(true)}>עריכה</button>)}
          </div>

          {!editMode ? (
            <div className="read-grid">
              <div><small>שם</small><b>{group.name || '-'}</b></div>
              <div><small>תיאור</small><div>{group.description || '-'}</div></div>
              <div><small>מקס׳ זוכים</small><b>{group.maxWinners ?? 1}</b></div>
              <div><small>תאריך סיום</small><b>{group.endDate ? new Date(group.endDate).toLocaleDateString('he-IL') : '-'}</b></div>
              <div><small>נעילה</small><b>{group.isLocked ? '🔒 נעולה' : 'פתוחה'}</b></div>
              {group.symbol ? (<div><small>סמל</small><b>{group.symbol}</b></div>) : null}
              {group.photoUrl ? (<div><small>תמונה</small><a href={group.photoUrl} className="link" target="_blank" rel="noreferrer">פתיחה</a></div>) : null}
              <div><small>נוצר ע״י</small><b>{group.createdBy || '-'}</b></div>
              {updateError && <div className="err" style={{ marginTop: 6 }}>{updateError}</div>}
              {updateSuccess && <div className="ok" style={{ marginTop: 6 }}>נשמר בהצלחה</div>}
            </div>
          ) : (
            <form className="field" onSubmit={onSaveGroup}>
              <label>שם *</label>
              <input className="input" name="name" required value={form.name} onChange={onGroupChange} />
              <label>תיאור</label>
              <textarea className="input" rows={3} name="description" value={form.description} onChange={onGroupChange} />
              <div className="grid-2">
                <div>
                  <label>מקס׳ זוכים</label>
                  <input className="input" name="maxWinners" type="number" min={1} value={form.maxWinners} onChange={onGroupChange} />
                </div>
                <div>
                  <label>תאריך סיום</label>
                  <input className="input" name="endDate" type="date" value={form.endDate} onChange={onGroupChange} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <input type="checkbox" name="isLocked" checked={!!form.isLocked} onChange={onGroupChange} />
                קבוצה נעולה (חברים נכנסים דרך בקשות)
              </label>
              <label>סמל (אופציונלי)</label>
              <input className="input" name="symbol" value={form.symbol} onChange={onGroupChange} placeholder="למשל: א׳" />
              <label>קישור תמונה (אופציונלי)</label>
              <input className="input" name="photoUrl" type="url" value={form.photoUrl} onChange={onGroupChange} placeholder="https://..." />
              {updateError ? (<div className="err" style={{ marginTop: 6 }}>{updateError}</div>) : null}
              <div className="actions-row">
                <button className="gs-btn" type="submit" disabled={updateLoading}>שמור</button>
                <button className="gs-btn-outline" type="button" onClick={onCancelEdit} disabled={updateLoading}>ביטול</button>
              </div>
            </form>
          )}
        </section>

        {/* סיידבר */}
        <aside className="sidebar">
          <details open className="acc">
            <summary className="acc-sum">מועמדים</summary>
            <div className="acc-body">
              {candLoading ? <div>טוען מועמדים…</div>
                : candError ? <div className="err">{candError}</div>
                  : !candidates.length ? <div className="muted">אין מועמדים בקבוצה.</div>
                    : (
                      <ul className="list">
                        {candidates.map((c) => (
                          <li key={String(c._id)} className="row">
                            <div className="row-main">
                              <div className="title">{c.name || '(ללא שם)'} {c.symbol ? `· ${c.symbol}` : ''}</div>
                              {(c.description || c.photoUrl) && <div className="sub">{c.description || ''}{c.photoUrl ? ` · ${c.photoUrl}` : ''}</div>}
                            </div>
                            <div className="row-actions"><button className="small danger" onClick={() => dispatch(deleteCandidate({ candidateId: String(c._id), groupId }))}>הסר/י</button></div>
                          </li>
                        ))}
                      </ul>
                    )}
            </div>
          </details>

          {group.isLocked && (
            <details className="acc">
              <summary className="acc-sum">בקשות הצטרפות</summary>
              <div className="acc-body">
                {reqsLoading ? <div>טוען בקשות…</div>
                  : reqsError ? <div className="err">{reqsError}</div>
                    : !reqs.length ? <div className="muted">אין בקשות כרגע.</div>
                      : (
                        <ul className="list">
                          {reqs.map((r) => (
                            <li key={r._id} className="row">
                              <div className="row-main">
                                <div className="title">{r.name || r.email}</div>
                                <div className="sub">{r.email} · {new Date(r.createdAt).toLocaleString('he-IL')}</div>
                              </div>
                              <div className="row-actions">
                                <button
                                  className="small"
                                  onClick={() =>
                                    dispatch(approveJoinRequest({ groupId, requestId: r._id }))
                                      .unwrap()
                                      .then(() => {
                                        const uid = getReqUserId(r);
                                        if (uid) dispatch(upsertUsers({ _id: uid, name: r.name, email: r.email }));
                                        dispatch(fetchJoinRequests(groupId));
                                        dispatch(fetchGroupWithMembers(groupId));
                                      })
                                  }
                                >אשר/י</button>
                                <button
                                  className="small danger"
                                  onClick={() =>
                                    dispatch(rejectJoinRequest({ groupId, requestId: r._id }))
                                      .unwrap()
                                      .then(() => {
                                        dispatch(fetchJoinRequests(groupId));
                                        dispatch(fetchGroupWithMembers(groupId));
                                      })
                                  }
                                >דחה/י</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
              </div>
            </details>
          )}

          {/* משתתפי הקבוצה – אחרי העשרה */}
          <details className="acc">
            <summary className="acc-sum">משתתפי הקבוצה</summary>
            <div className="acc-body">
              {!enrichedMembers?.length ? (
                <div className="muted">אין משתתפים עדיין.</div>
              ) : (
                <ul className="list">
                  {enrichedMembers.map((m) => <MemberRow key={m._id || m.id} m={m} />)}
                </ul>
              )}
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}
