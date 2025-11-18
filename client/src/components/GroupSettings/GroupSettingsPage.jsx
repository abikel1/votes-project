// src/pages/GroupSettingsPage.jsx
import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import {
  fetchGroupWithMembers,
  updateGroup,
  clearUpdateState,
  selectSelectedGroupMembersEnriched,
  removeGroupMember,
  deleteGroupById,
} from '../../slices/groupsSlice';

import {
  fetchCandidatesByGroup,
  createCandidate,
  deleteCandidate,
  updateCandidate,
  selectCandidatesForGroup,
  selectCandidatesLoadingForGroup,
  selectCandidatesErrorForGroup,
  selectCandidateUpdating,
  selectCandidateUpdateError,
} from '../../slices/candidateSlice';

import {
  fetchJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  selectJoinRequestsForGroup,
  selectJoinRequestsLoading,
  selectJoinRequestsError
} from '../../slices/joinRequestsSlice';

import {
  fetchVotersByGroup,
  selectVotersForGroup,
  selectVotersLoadingForGroup,
  selectVotersErrorForGroup,
} from '../../slices/votesSlice';

import { upsertUsers } from '../../slices/usersSlice';
import http from '../../api/http';
import './GroupSettingsPage.css';

const EMPTY_ARR = Object.freeze([]);
const makeSlug = (name = '') =>
  encodeURIComponent(
    String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
  );
// עוזר לתאריך
function toLocalDateInputValue(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

function getReqUserId(r) {
  return String(
    r.userId ?? r.user_id ?? r.applicantId ?? r.applicant_id ?? r.user?._id ?? r.user?.id ?? ''
  ) || null;
}

function MemberRow({ m, onRemove, isOwner }) {
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
      {isOwner && onRemove && (
        <div className="row-actions">
          <button className="small danger" onClick={onRemove}>הסר/י</button>
        </div>
      )}
    </li>
  );
}

// מחלץ שם קובץ מתוך URL /uploads/... (לשרת אנחנו שולחים רק את שם הקובץ)
function oldRelFromUrl(u = '') {
  if (!u) return '';
  try {
    u = decodeURIComponent(String(u));
  } catch {
    // מתעלמים
  }
  const i = u.indexOf('/uploads/');
  if (i !== -1) {
    u = u.slice(i + '/uploads/'.length);
  }
  // להיפטר מפרמטרים / עוגנים
  u = u.split('?')[0].split('#')[0];
  return u.split('/').pop() || '';
}

// עוזר להצגת שם מצביע יפה
const humanizeName = (raw, email) => {
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  if (!raw && email) {
    const local = String(email).split('@')[0] || '';
    const parts = local.split(/[._\-]+/).filter(Boolean);
    return parts.length ? parts.map(cap).join(' ') : local;
  }
  if (!raw) return '(ללא שם)';

  let s = String(raw).trim();

  if (/\s/.test(s)) {
    return s.replace(/\s+/g, ' ')
      .split(' ')
      .map(w => cap(w.toLowerCase()))
      .join(' ');
  }

  let parts = s.split(/[._\-]+/).filter(Boolean);

  if (parts.length === 1) {
    parts = s.split(/(?=[A-Z])/).filter(Boolean);
  }

  if (parts.length === 1 && email) {
    const local = String(email).split('@')[0] || '';
    const emailParts = local.split(/[._\-]+/).filter(Boolean);
    if (emailParts.length > 1) parts = emailParts;
  }

  return parts.map(p => cap(p.toLowerCase())).join(' ') || s;
};

export default function GroupSettingsPage() {
  const { groupSlug } = useParams();
  const location = useLocation();
  const groupId = location.state?.groupId || null;

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
  const { userId, userEmail, firstName, lastName } = useSelector(s => s.auth);

  const candidates = useSelector(selectCandidatesForGroup(groupId)) || EMPTY_ARR;
  const candLoading = useSelector(selectCandidatesLoadingForGroup(groupId));
  const candError = useSelector(selectCandidatesErrorForGroup(groupId));

  const reqs = useSelector(selectJoinRequestsForGroup(groupId)) || EMPTY_ARR;
  const reqsLoading = useSelector(selectJoinRequestsLoading(groupId));
  const reqsError = useSelector(selectJoinRequestsError(groupId));

  const voters = useSelector(selectVotersForGroup(groupId)) || EMPTY_ARR;
  const votersLoading = useSelector(selectVotersLoadingForGroup(groupId));
  const votersError = useSelector(selectVotersErrorForGroup(groupId));

  const [form, setForm] = useState({
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
    maxWinners: 1,
    endDate: '',
    isLocked: false,
  });
  const [editMode, setEditMode] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const confirmSlug = useMemo(() => {
    if (!group) return '';
    const by = (group.createdBy || '').trim();
    const nm = (group.name || '').trim();
    return `${by}/${nm}`;
  }, [group]);
  const [typedSlug, setTypedSlug] = useState('');

  // טופס יצירת מועמד/ת
  const [candForm, setCandForm] = useState({
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
  });

  // עריכת מועמד/ת
  const [editCandOpen, setEditCandOpen] = useState(false);
  const [editCandForm, setEditCandForm] = useState({
    _id: '',
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
  });
  const updatingThisCandidate = useSelector(selectCandidateUpdating(editCandForm._id || ''));
  const updateCandidateError = useSelector(selectCandidateUpdateError(editCandForm._id || ''));

  // סטטוס העלאות
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  // קלטי קובץ חבויים לשינוי תמונה
  const newFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;   // 👈 אם אין groupId – לא שולחים בקשות
    dispatch(fetchGroupWithMembers(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
    dispatch(fetchVotersByGroup(groupId));
  }, [dispatch, groupId]);


  useEffect(() => {
    if (!groupId || !group?.isLocked) return;  // 👈 בלי groupId או בלי נעילה – לא לעשות כלום
    dispatch(fetchJoinRequests(groupId));
  }, [dispatch, groupId, group?.isLocked]);


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

    const byEmail =
      group?.createdBy &&
      userEmail &&
      String(group.createdBy).trim().toLowerCase() === String(userEmail).trim().toLowerCase();

    const byId =
      group?.createdById &&
      userId &&
      String(group.createdById) === String(userId);

    const byFullName =
      group?.createdBy &&
      firstName &&
      lastName &&
      !String(group.createdBy).includes('@') &&
      String(group.createdBy).trim().toLowerCase() ===
      `${firstName} ${lastName}`.trim().toLowerCase();

    return !!(byEmail || byId || byFullName);
  }, [group, userEmail, userId, firstName, lastName]);


  const slug = group ? makeSlug(group.name || groupSlug || groupId) : groupSlug;

// קישורי שיתוף
const sharePath = useMemo(() => {
  if (!group) return '';
  // בקבוצה נעולה – נשאיר id (שלא לשבור מה שכבר עובד)
  if (group.isLocked) return `/join/${groupId}`;
  // קבוצה פתוחה – לינק רק לפי שם, בלי id
  return `/groups/${slug}`;
}, [group, groupId, slug]);

const shareUrl = useMemo(() => {
  if (!sharePath) return '';
  return `${window.location.origin}${sharePath}`;
}, [sharePath]);

// 👇 זה צריך לבוא אחרי shareUrl
const prettyShareUrl = shareUrl ? decodeURI(shareUrl) : '';


  const [copied, setCopied] = useState(false);
  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(prettyShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const tmp = document.createElement('input');
      tmp.value = shareUrl;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!groupId) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div>לא נמצא מזהה קבוצה.</div>
        <button className="gs-btn" onClick={() => navigate('/groups')}>
          חזרה לרשימת הקבוצות
        </button>
      </div>
    );
  }


  if (groupLoading) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div>טוען...</div>
      </div>
    );
  }
  if (groupError) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div className="err">{groupError}</div>
      </div>
    );
  }
  if (!group) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div>לא נמצאה קבוצה.</div>
      </div>
    );
  }

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
    setForm(prev => ({
      ...prev,
      [name]:
        name === 'maxWinners'
          ? Number(value)
          : type === 'checkbox'
            ? checked
            : value,
    }));
  };

  const onSaveGroup = async (e) => {
    e.preventDefault();
    const patch = {
      name: form.name.trim(),
      description: form.description.trim(),
      symbol: (form.symbol || '').trim(),
      maxWinners: Number(form.maxWinners) || 1,
      isLocked: !!form.isLocked,
      ...(form.endDate ? { endDate: new Date(form.endDate).toISOString() } : {}),
    };
    await dispatch(updateGroup({ groupId, patch })).unwrap();
    setEditMode(false);
    if (patch.isLocked) dispatch(fetchJoinRequests(groupId));
    dispatch(fetchGroupWithMembers(groupId));
    dispatch(fetchVotersByGroup(groupId));
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
        isLocked: !!group.isLocked,
      });
    }
  };

  // יצירת מועמד/ת
  const onAddCandidate = (e) => {
    e.preventDefault();
if (!candForm.name.trim()) return toast.error('שם מועמד/ת חובה');






    dispatch(createCandidate({ groupId, ...candForm }))
      .unwrap()
      .then(() => setCandForm({ name: '', description: '', symbol: '', photoUrl: '' }))
      .then(() => dispatch(fetchCandidatesByGroup(groupId)));
  };

  const onDeleteCandidate = (cid) =>
    dispatch(deleteCandidate({ candidateId: cid, groupId }));

  const doDeleteGroup = async () => {
    try {
      await dispatch(deleteGroupById(groupId)).unwrap();
      setDeleteOpen(false);
      navigate('/groups');
    } catch (e) {
toast.error(e || 'מחיקה נכשלה');






    }
  };

  const formatVoterTitle = (v) => {
    const composed =
      v?.name ||
      [v?.firstName || v?.first_name, v?.lastName || v?.last_name]
        .filter(Boolean)
        .join(' ');
    return humanizeName(composed, v?.email);
  };

  // פתיחת מודאל עריכת מועמד/ת
  const openEditCandidate = (c) => {
    setEditCandForm({
      _id: String(c._id),
      name: c.name || '',
      description: c.description || '',
      symbol: c.symbol || '',
      photoUrl: c.photoUrl || '',
    });
    setEditCandOpen(true);
  };

  const onEditCandChange = (e) => {
    const { name, value } = e.target;
    setEditCandForm(prev => ({ ...prev, [name]: value }));
  };

  const onSaveEditedCandidate = async (e) => {
    e.preventDefault();
    const { _id, name, description, symbol, photoUrl } = editCandForm;
if (!name?.trim()) return toast.error('שם מועמד/ת חובה');







    const patch = {
      name: name.trim(),
      description: (description || '').trim(),
      symbol: (symbol || '').trim(),
      photoUrl: (photoUrl || '').trim(),
    };

    try {
      await dispatch(updateCandidate({ candidateId: _id, groupId, patch })).unwrap();
      setEditCandOpen(false);
      dispatch(fetchCandidatesByGroup(groupId));
    } catch (err) {
toast.error(err || 'עדכון נכשל');






    }
  };

  const onCancelEditCandidate = () => setEditCandOpen(false);

  // העלאת תמונה (חדש/עריכה) - שולח לשרת גם שם קובץ ישן למחיקה
  const handleUpload = async (file, which) => {
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);

    const oldRel =
      which === 'new'
        ? oldRelFromUrl(candForm.photoUrl)
        : oldRelFromUrl(editCandForm.photoUrl);

    try {
      if (which === 'new') setUploadingNew(true);
      if (which === 'edit') setUploadingEdit(true);

      // http baseURL = '/api' ⇒ זה ילך ל /api/upload
      const { data } = await http.post(
        `/upload?old=${encodeURIComponent(oldRel)}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const url = data?.url || '';
      if (!url) throw new Error('Bad upload response');

      if (which === 'new') {
        setCandForm(prev => ({ ...prev, photoUrl: url }));
      } else {
        setEditCandForm(prev => ({ ...prev, photoUrl: url }));
      }
    } catch (e) {
toast.error(e?.response?.data?.message || e?.message || 'העלאה נכשלה');






    } finally {
      if (which === 'new') setUploadingNew(false);
      if (which === 'edit') setUploadingEdit(false);
    }
  };

  const clearNewPhoto = () =>
    setCandForm(prev => ({ ...prev, photoUrl: '' }));

  const clearEditPhoto = () =>
    setEditCandForm(prev => ({ ...prev, photoUrl: '' }));

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
              <button
                className="gs-btn-outline"
                onClick={() => setEditMode(true)}
              >
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
              <div>
                <small>נעילה</small>
                <b>{group.isLocked ? '🔒 נעולה' : 'פתוחה'}</b>
              </div>
              {group.symbol && (
                <div>
                  <small>סמל</small>
                  <b>{group.symbol}</b>
                </div>
              )}
              {group.photoUrl && (
                <div>
                  <small>תמונה</small>
                  <a
                    href={group.photoUrl}
                    className="link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    פתיחה
                  </a>
                </div>
              )}
              <div>
                <small>נוצר ע״י</small>
                <b>{group.createdBy || '-'}</b>
              </div>

              {/* קישור שיתוף */}
              <div>
                <small>קישור שיתוף</small>
                {shareUrl ? (
                  <div className="share-row">
                    <input
                      className="input share-input"
                      value={prettyShareUrl}
                      readOnly
                      style={{ direction: 'ltr' }}
                      onFocus={(e) => e.target.select()}
                      aria-label="קישור לשיתוף"
                    />
                    <div className="share-actions">
                      <button
                        className="gs-btn"
                        type="button"
                        onClick={copyShareUrl}
                      >
                        {copied ? 'הועתק ✓' : 'העתק'}
                      </button>
                    </div>

                    <div className="muted share-hint">
                      {group.isLocked
                        ? 'קבוצה נעולה: הקישור יבקש התחברות ואז ישלח בקשת הצטרפות.'
                        : 'קבוצה פתוחה: הקישור מוביל ישירות לעמוד הקבוצה.'}
                    </div>
                  </div>
                ) : (
                  <div className="muted">—</div>
                )}
              </div>

              {updateError && (
                <div className="err" style={{ marginTop: 6 }}>
                  {updateError}
                </div>
              )}
              {updateSuccess && (
                <div className="ok" style={{ marginTop: 6 }}>
                  נשמר בהצלחה
                </div>
              )}
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
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <input
                  type="checkbox"
                  name="isLocked"
                  checked={!!form.isLocked}
                  onChange={onGroupChange}
                />
                קבוצה נעולה (חברים נכנסים דרך בקשות)
              </label>
              <label>סמל (אופציונלי)</label>
              <input
                className="input"
                name="symbol"
                value={form.symbol}
                onChange={onGroupChange}
                placeholder="למשל: א׳"
              />
              {updateError && (
                <div className="err" style={{ marginTop: 6 }}>
                  {updateError}
                </div>
              )}
              <div className="actions-row">
                <button
                  className="gs-btn"
                  type="submit"
                  disabled={updateLoading}
                >
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

        {/* סיידבר */}
        <aside className="sidebar">
          {/* מועמדים */}
          <details open className="acc">
            <summary className="acc-sum">מועמדים</summary>
            <div className="acc-body">
              {candLoading ? (
                <div>טוען מועמדים…</div>
              ) : candError ? (
                <div className="err">{candError}</div>
              ) : !candidates.length ? (
                <div className="muted">אין מועמדים בקבוצה.</div>
              ) : (
                <ul className="list">
                  {candidates.map((c) => (
                    <li key={String(c._id)} className="row">
                      <div className="row-main">
                        <div className="title">
                          {c.photoUrl && (
                            <img
                              className="avatar"
                              src={c.photoUrl}
                              alt=""
                            />
                          )}
                          {c.name || '(ללא שם)'}{' '}
                          {c.symbol ? `· ${c.symbol}` : ''}
                        </div>
                        {c.description && (
                          <div className="sub">{c.description}</div>
                        )}
                      </div>
                      <div className="row-actions">
                        <button
                          className="small"
                          onClick={() => openEditCandidate(c)}
                        >
                          עריכה
                        </button>
                        <button
                          className="small danger"
                          onClick={() =>
                            onDeleteCandidate(String(c._id))
                          }
                        >
                          הסר/י
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>

          {/* הוספת מועמד/ת */}
          <details className="acc">
            <summary className="acc-sum">הוספת מועמד/ת</summary>
            <div className="acc-body">
              <form onSubmit={onAddCandidate} className="field">
                <label>שם *</label>
                <input
                  className="input"
                  name="name"
                  value={candForm.name}
                  onChange={(e) =>
                    setCandForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
                <label>תיאור</label>
                <textarea
                  className="input"
                  rows={3}
                  name="description"
                  value={candForm.description}
                  onChange={(e) =>
                    setCandForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                />
                <label>סמל (אופציונלי)</label>
                <input
                  className="input"
                  name="symbol"
                  value={candForm.symbol}
                  onChange={(e) =>
                    setCandForm((p) => ({ ...p, symbol: e.target.value }))
                  }
                  placeholder="למשל: א׳"
                />

                <label>תמונה</label>

                {/* קלט קובץ חבוי - עבור כפתור "שינוי תמונה" */}
                <input
                  ref={newFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleUpload(e.target.files?.[0], 'new')}
                  disabled={uploadingNew}
                />

                {!candForm.photoUrl ? (
                  <div className="upload-row">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e.target.files?.[0], 'new')}
                      disabled={uploadingNew}
                    />
                    {uploadingNew && (
                      <span className="muted">מעלה…</span>
                    )}
                  </div>
                ) : (
                  <div className="thumb-row">
                    <img
                      className="thumb"
                      src={candForm.photoUrl}
                      alt="תצוגה מקדימה"
                    />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="gs-btn"
                        onClick={() => newFileInputRef.current?.click()}
                        disabled={uploadingNew}
                      >
                        שינוי תמונה
                      </button>
                      <button
                        type="button"
                        className="gs-btn-outline"
                        onClick={clearNewPhoto}
                        disabled={uploadingNew}
                      >
                        הסר תמונה
                      </button>
                    </div>
                    {uploadingNew && (
                      <span className="muted">מעלה…</span>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 8 }}>
                  <button className="gs-btn" type="submit">
                    הוסף/י מועמד/ת
                  </button>
                </div>
              </form>
            </div>
          </details>

          {/* המצביעים */}
          <details className="acc">
            <summary className="acc-sum">המצביעים</summary>
            <div className="acc-body">
              {votersLoading ? (
                <div>טוען מצביעים…</div>
              ) : votersError ? (
                <div className="err">{votersError}</div>
              ) : !voters.length ? (
                <div className="muted">אין מצביעים עדיין.</div>
              ) : (
                <ul className="list">
                  {voters.map((v) => {
                    const titleName = formatVoterTitle(v);
                    const email = v.email;
                    const when =
                      v.lastVoteAt || v.votedAt || v.createdAt;

                    return (
                      <li
                        key={String(
                          v._id || v.userId || v.id
                        )}
                        className="row"
                      >
                        <div className="row-main">
                          <div className="title">{titleName}</div>
                          <div className="sub">
                            {email ? `${email}` : ''}
                            {when
                              ? ` · ${new Date(
                                when
                              ).toLocaleString('he-IL')}`
                              : ''}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </details>

          {/* בקשות הצטרפות — רק בקבוצה נעולה */}
          {group.isLocked && (
            <details className="acc">
              <summary className="acc-sum">בקשות הצטרפות</summary>
              <div className="acc-body">
                {reqsLoading ? (
                  <div>טוען בקשות…</div>
                ) : reqsError ? (
                  <div className="err">{reqsError}</div>
                ) : !reqs.length ? (
                  <div className="muted">אין בקשות כרגע.</div>
                ) : (
                  <ul className="list">
                    {reqs.map((r) => (
                      <li key={r._id} className="row">
                        <div className="row-main">
                          <div className="title">
                            {r.name || r.email}
                          </div>
                          <div className="sub">
                            {r.email} ·{' '}
                            {new Date(
                              r.createdAt
                            ).toLocaleString('he-IL')}
                          </div>
                        </div>
                        <div className="row-actions">
                          <button
                            className="small"
                            onClick={() =>
                              dispatch(
                                approveJoinRequest({
                                  groupId,
                                  requestId: r._id,
                                })
                              )
                                .unwrap()
                                .then(() => {
                                  const uid = getReqUserId(r);
                                  if (uid)
                                    dispatch(
                                      upsertUsers({
                                        _id: uid,
                                        name: r.name,
                                        email: r.email,
                                      })
                                    );
                                  dispatch(
                                    fetchJoinRequests(groupId)
                                  );
                                  dispatch(
                                    fetchGroupWithMembers(
                                      groupId
                                    )
                                  );
                                })
                            }
                          >
                            אשר/י
                          </button>
                          <button
                            className="small danger"
                            onClick={() =>
                              dispatch(
                                rejectJoinRequest({
                                  groupId,
                                  requestId: r._id,
                                })
                              )
                                .unwrap()
                                .then(() => {
                                  dispatch(
                                    fetchJoinRequests(groupId)
                                  );
                                  dispatch(
                                    fetchGroupWithMembers(
                                      groupId
                                    )
                                  );
                                })
                            }
                          >
                            דחה/י
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          )}

          {/* משתתפי הקבוצה — רק כשנעול */}
          {group.isLocked && (
            <details className="acc">
              <summary className="acc-sum">משתתפי הקבוצה</summary>
              <div className="acc-body">
                {!enrichedMembers?.length ? (
                  <div className="muted">
                    אין משתתפים עדיין.
                  </div>
                ) : (
                  <ul className="list">
                    {enrichedMembers.map((m) => {
                      const mid = String(m._id || m.id);
                      const removable =
                        isOwner &&
                        String(group.createdById) !== mid;
                      const onRemove = removable
                        ? async () => {
                          toast.error(`הסרה נכשלה – נדרש אישור להסרה`);

                          if (
                            
                            !window.confirm(
                              `להסיר את ${m.name || m.email || mid
                              } מהקבוצה?`
                            )
                          )
                            return;
                          try {
                            await dispatch(
                              removeGroupMember({
                                groupId,
                                memberId: mid,
                                email: m.email || undefined,
                              })
                            ).unwrap();
                            if (group.isLocked)
                              dispatch(
                                fetchJoinRequests(
                                  groupId
                                )
                              );
                            dispatch(
                              fetchGroupWithMembers(
                                groupId
                              )
                            );
                          }catch (e) {
  toast.error(e || 'Failed to remove member');
}
                        }
                        : undefined;

                      return (
                        <MemberRow
                          key={mid}
                          m={m}
                          onRemove={onRemove}
                          isOwner={isOwner}
                        />
                      );
                    })}
                  </ul>
                )}
              </div>
            </details>
          )}

          {/* אזור מסוכן: מחיקת קבוצה */}
          <details className="acc danger">
            <summary className="acc-sum">מחיקת קבוצה</summary>
            <div className="acc-body">
              <p className="danger-text">
                מחיקה היא פעולה בלתי הפיכה. כל נתוני
                הקבוצה יימחקו לכולם.
              </p>
              <button
                className="btn-danger"
                onClick={() => {
                  setDeleteOpen(true);
                  setTypedSlug('');
                }}
              >
                מחיקת הקבוצה…
              </button>
            </div>
          </details>
        </aside>
      </div>

      {/* מודאל מחיקה */}
      {deleteOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setDeleteOpen(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>מחק/י את הקבוצה</h3>
            <p className="muted" style={{ marginTop: 6 }}>
              כדי לאשר, הקלד/י בתיבה את{' '}
              <b>{confirmSlug}</b>
            </p>
            <input
              className="input"
              placeholder={confirmSlug}
              value={typedSlug}
              onChange={(e) =>
                setTypedSlug(e.target.value)
              }
              style={{ direction: 'ltr' }}
            />
            <div
              className="actions-row"
              style={{ marginTop: 12 }}
            >
              <button
                className="gs-btn-outline"
                onClick={() => setDeleteOpen(false)}
              >
                ביטול
              </button>
              <button
                className="btn-danger"
                disabled={
                  typedSlug.trim() !== confirmSlug
                }
                onClick={doDeleteGroup}
                title={
                  typedSlug.trim() !== confirmSlug
                    ? 'יש להקליד בדיוק את הערך לעיל'
                    : undefined
                }
              >
                מחיקת הקבוצה לצמיתות
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מודאל עריכת מועמד/ת */}
      {editCandOpen && (
        <div
          className="modal-backdrop"
          onClick={() =>
            !updatingThisCandidate &&
            setEditCandOpen(false)
          }
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>עריכת מועמד/ת</h3>
            <form
              className="field"
              onSubmit={onSaveEditedCandidate}
            >
              <label>שם *</label>
              <input
                className="input"
                name="name"
                value={editCandForm.name}
                onChange={onEditCandChange}
                required
                disabled={updatingThisCandidate}
              />
              <label>תיאור</label>
              <textarea
                className="input"
                rows={3}
                name="description"
                value={editCandForm.description}
                onChange={onEditCandChange}
                disabled={updatingThisCandidate}
              />
              <label>סמל (אופציונלי)</label>
              <input
                className="input"
                name="symbol"
                value={editCandForm.symbol}
                onChange={onEditCandChange}
                placeholder="למשל: א׳"
                disabled={updatingThisCandidate}
              />

              <label>תמונה</label>

              {/* קלט קובץ חבוי - עבור כפתור "שינוי תמונה" */}
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) =>
                  handleUpload(
                    e.target.files?.[0],
                    'edit'
                  )
                }
                disabled={
                  updatingThisCandidate || uploadingEdit
                }
              />

              {!editCandForm.photoUrl ? (
                <div className="upload-row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleUpload(
                        e.target.files?.[0],
                        'edit'
                      )
                    }
                    disabled={
                      updatingThisCandidate || uploadingEdit
                    }
                  />
                  {(updatingThisCandidate ||
                    uploadingEdit) && (
                      <span className="muted">
                        מעלה…
                      </span>
                    )}
                </div>
              ) : (
                <div className="thumb-row">
                  <img
                    className="thumb"
                    src={editCandForm.photoUrl}
                    alt="תצוגה מקדימה"
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="gs-btn"
                      onClick={() => editFileInputRef.current?.click()}
                      disabled={updatingThisCandidate || uploadingEdit}
                    >
                      שינוי תמונה
                    </button>
                    <button
                      type="button"
                      className="gs-btn-outline"
                      onClick={clearEditPhoto}
                      disabled={updatingThisCandidate}
                    >
                      הסר תמונה
                    </button>
                  </div>
                  {(updatingThisCandidate ||
                    uploadingEdit) && (
                      <span className="muted">
                        מעלה…
                      </span>
                    )}
                </div>
              )}

              {updateCandidateError && (
                <div
                  className="err"
                  style={{ marginTop: 6 }}
                >
                  {updateCandidateError}
                </div>
              )}

              <div className="actions-row">
                <button
                  className="gs-btn"
                  type="submit"
                  disabled={updatingThisCandidate}
                >
                  {updatingThisCandidate
                    ? 'שומר/ת…'
                    : 'שמור/י'}
                </button>
                <button
                  className="gs-btn-outline"
                  type="button"
                  onClick={onCancelEditCandidate}
                  disabled={updatingThisCandidate}
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
