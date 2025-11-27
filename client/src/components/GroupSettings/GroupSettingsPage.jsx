// src/components/GroupSettings/GroupSettingsPage.jsx
import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUsers, FaUserPlus, FaUserCheck, FaUserTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { uploadImage } from './uploadImage';
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
  selectJoinRequestsError,
} from '../../slices/joinRequestsSlice';

import {
  fetchVotersByGroup,
  selectVotersForGroup,
  selectVotersLoadingForGroup,
  selectVotersErrorForGroup,
} from '../../slices/votesSlice';
import { BiArrowBack } from 'react-icons/bi';

import { upsertUsers } from '../../slices/usersSlice';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import GeneralTab from './GeneralTab';
import CandidatesTab from './CandidatesTab';
import VotersTab from './VotersTab';
import JoinRequestsTab from './JoinRequestsTab';
import MembersTab from './MembersTab';
import DangerTab from './DangerTab';
import EditCandidateModal from './EditCandidateModal';
import DeleteGroupModal from './DeleteGroupModal';
import CandidateRequestsTab from './CandidateRequestsTab';
import {
  approveCandidateRequest,
  rejectCandidateRequest,
  fetchCandidateRequestsByGroup,
} from '../../slices/candidateSlice';



import './GroupSettingsPage.css';

import {
  EMPTY_ARR,
  makeSlug,
  toLocalDateInputValue,
  getReqUserId,
  humanizeName,
  validateCandidateFields,
} from './groupSettingsHelpers';

import http from '../../api/http';

// ---------- קומפוננטה ראשית ----------

export default function GroupSettingsPage() {
  const { groupSlug } = useParams();
  const location = useLocation();

  // id שהועבר בניווט פנימי (מכרטיס קבוצה)
  const navGroupId = location.state?.groupId || null;

  // state פנימי ל-id של הקבוצה
  const [groupId, setGroupId] = useState(navGroupId);
  const [slugResolved, setSlugResolved] = useState(!!navGroupId); // האם ניסינו לפתור slug ל-id

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
  const { userId, userEmail, firstName, lastName, isAdmin } = useSelector((s) => s.auth);
  // const { userId, userEmail, firstName, lastName } = useSelector((s) => s.auth);

  const candidates =
    useSelector(selectCandidatesForGroup(groupId || '')) || EMPTY_ARR;
  const candLoading = useSelector(
    selectCandidatesLoadingForGroup(groupId || ''),
  );
  const candError = useSelector(
    selectCandidatesErrorForGroup(groupId || ''),
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const reqs =
    useSelector(selectJoinRequestsForGroup(groupId || '')) || EMPTY_ARR;
  const reqsLoading = useSelector(
    selectJoinRequestsLoading(groupId || ''),
  );
  const reqsError = useSelector(selectJoinRequestsError(groupId || ''));

  const voters =
    useSelector(selectVotersForGroup(groupId || '')) || EMPTY_ARR;
  const votersLoading = useSelector(
    selectVotersLoadingForGroup(groupId || ''),
  );
  const votersError = useSelector(
    selectVotersErrorForGroup(groupId || ''),
  );

  // טאב נבחר
  const [activeTab, setActiveTab] = useState('general');

  // טופס קבוצה
  const [form, setForm] = useState({
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
    maxWinners: 1,
    endDate: '',
    candidateEndDate: '',
    isLocked: false,
  });
  const [editMode, setEditMode] = useState(false);

  // מחיקת קבוצה
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [typedSlug, setTypedSlug] = useState('');

  // טופס יצירת מועמד/ת
  const [candForm, setCandForm] = useState({
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
  });
  const [candErrors, setCandErrors] = useState({});

  // עריכת מועמד/ת
  const [editCandOpen, setEditCandOpen] = useState(false);
  const [editCandForm, setEditCandForm] = useState({
    _id: '',
    name: '',
    description: '',
    symbol: '',
    photoUrl: '',
  });
  const [editCandErrors, setEditCandErrors] = useState({});

  const updatingCurrentCandidate = useSelector(
    selectCandidateUpdating(editCandForm._id || ''),
  );
  const updateCandidateError = useSelector(
    selectCandidateUpdateError(editCandForm._id || ''),
  );

  // סטטוס העלאות
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const newFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [selectedCandidate, setSelectedCandidate] = useState(null);


  // שיתוף
  const [copied, setCopied] = useState(false);

  // ---- פתרון slug ל-id כשנכנסים ישירות ל-URL ----
  useEffect(() => {
    // אם הגיע id בניווט – לא צריך פתרון דרך slug
    if (navGroupId) {
      setGroupId(navGroupId);
      setSlugResolved(true);
      return;
    }

    if (!groupSlug) return;

    (async () => {
      try {
        const { data } = await http.get(`/groups/slug/${groupSlug}`);
        setGroupId(data._id);
      } catch (err) {
        console.error('failed to resolve group by slug', err);
        setGroupId(null);
      } finally {
        setSlugResolved(true);
      }
    })();
  }, [navGroupId, groupSlug]);

  // טעינת נתונים לפי groupId
  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupWithMembers(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
    dispatch(fetchCandidateRequestsByGroup(groupId));
    dispatch(fetchVotersByGroup(groupId));
  }, [dispatch, groupId]);


  useEffect(() => {
    if (!groupId || !group?.isLocked) return;
    dispatch(fetchJoinRequests(groupId));
  }, [dispatch, groupId, group?.isLocked]);

  useEffect(
    () => () => {
      dispatch(clearUpdateState());
    },
    [dispatch],
  );

  useEffect(() => {
    if (group) {
      setForm({
        name: group.name || '',
        description: group.description || '',
        symbol: group.symbol || '',
        photoUrl: group.photoUrl || '',
        maxWinners: group.maxWinners ?? 1,
        endDate: toLocalDateInputValue(group.endDate),
        candidateEndDate: toLocalDateInputValue(group.candidateEndDate),
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
      String(group.createdBy).trim().toLowerCase() ===
      String(userEmail).trim().toLowerCase();

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

  const isOwnerOrAdmin = isOwner || isAdmin;

  const slug = group ? makeSlug(group.name || groupSlug || groupId) : groupSlug;

const handleDeleteCandidateClick = (candidate) => {
  if (!candidate || !candidate._id) {
    console.error('Candidate invalid:', candidate);
    return;
  }
  setSelectedCandidate(candidate);
  setShowDeleteConfirm(true);
};

const confirmDeleteCandidate = async () => {
  if (!selectedCandidate || !selectedCandidate._id) {
    toast.error('מחיקת המועמד נכשלה – מזהה לא נמצא');
    setShowDeleteConfirm(false);
    return;
  }

  try {
    await onDeleteCandidate(String(selectedCandidate._id));
    setShowDeleteConfirm(false);
    setSelectedCandidate(null);
  } catch (e) {
    toast.error('מחיקת המועמד נכשלה');
    console.error(e);
  }
};



  const sharePath = useMemo(() => {
    if (!group) return '';
    if (group.isLocked) return `/join/${slug}`;
    return `/groups/${slug}`;
  }, [group, slug]);

  const shareUrl = useMemo(() => {
    if (!sharePath) return '';
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const prettyShareUrl = shareUrl ? decodeURI(shareUrl) : '';

  const confirmSlug = useMemo(() => {
    if (!group) return '';
    const by = (group.createdBy || '').trim();
    const nm = (group.name || '').trim();
    return `${by}/${nm}`;
  }, [group]);

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

  // ---------- הגנות / מצבי טעינה ----------

  // עדיין פותרים את ה-slug ל-id
  if (!slugResolved && !groupId) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div>טוען נתוני קבוצה...</div>
      </div>
    );
  }

  // ניסינו לפתור slug ואין groupId בכלל – כנראה קבוצה לא קיימת
  if (slugResolved && !groupId) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div className="err">הקבוצה לא נמצאה.</div>
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
        <button className="gs-btn" onClick={() => navigate('/groups')}>
          חזרה לרשימת הקבוצות
        </button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div>לא נמצאה קבוצה.</div>
        <button className="gs-btn" onClick={() => navigate('/groups')}>
          חזרה לרשימת הקבוצות
        </button>
      </div>
    );
  }

  // משתמש מחובר אבל לא מנהל – הודעה נעימה
  if (!isOwnerOrAdmin) {
    return (
      <div className="gs-wrap">
        <h2>הגדרות קבוצה</h2>
        <div className="err">
          אין לך הרשאות ניהול לקבוצה זו.
          <br />
          רק מנהל/ת הקבוצה יכול/ה לצפות ולהתאים את ההגדרות.
          <br />
          אם את/ה צריך/ה שינוי, אפשר לפנות למנהל/ת הקבוצה.
        </div>
        <button className="gs-btn" onClick={() => navigate('/groups')}>
          חזרה לרשימת הקבוצות
        </button>
      </div>
    );
  }

  // ---------- handlers ----------
  const handleApprove = (req) => {
    dispatch(approveCandidateRequest({ groupId, requestId: req._id }))
      .unwrap()
      .then(() => {
        dispatch(fetchCandidatesByGroup(groupId));
        dispatch(fetchCandidateRequestsByGroup(groupId));
      });
  };

  const handleReject = (req) => {
    dispatch(rejectCandidateRequest({ groupId, requestId: req._id }))
      .unwrap()
      .then(() => {
        dispatch(fetchCandidatesByGroup(groupId));
        dispatch(fetchCandidateRequestsByGroup(groupId));
      });
  };


  const onGroupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
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

    const groupEnd = form.endDate ? new Date(form.endDate) : null;
    const candEnd = form.candidateEndDate ? new Date(form.candidateEndDate) : null;

    if (groupEnd && candEnd && candEnd > groupEnd) {
      toast.error("תאריך סיום הגשת מועמדות לא יכול להיות אחרי תאריך סיום הקבוצה");
      return; // מונע שליחת הבקשה לשרת
    }

    const patch = {
      name: form.name.trim(),
      description: form.description.trim(),
      symbol: (form.symbol || '').trim(),
      maxWinners: Number(form.maxWinners) || 1,
      isLocked: !!form.isLocked,
      ...(form.endDate ? { endDate: new Date(form.endDate).toISOString() } : {}),
      ...(form.candidateEndDate ? { candidateEndDate: new Date(form.candidateEndDate).toISOString() } : {}),
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
        candidateEndDate: toLocalDateInputValue(group.candidateEndDate),

        isLocked: !!group.isLocked,
      });
    }
  };

const onAddCandidate = (e) => {
  e.preventDefault();

  const errors = validateCandidateFields(candForm);

  if (!candForm.name.trim()) {
    toast.error('שם מועמד/ת חובה');
  }

  setCandErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }

  // ✅ כאן מוסיפים ברירת מחדל לתמונה אם לא קיימת
  const candidateData = {
    ...candForm,
    photoUrl: candForm.photoUrl || '/h.jpg',
  };

  dispatch(createCandidate({ groupId, ...candidateData }))
    .unwrap()
    .then(() => {
      setCandForm({
        name: '',
        description: '',
        symbol: '',
        photoUrl: '',
      });
      setCandErrors({});
    })
    .then(() => dispatch(fetchCandidatesByGroup(groupId)));
};


  const onDeleteCandidate = (cid) =>
    dispatch(deleteCandidate({ candidateId: cid, groupId }))
      .unwrap()
      .then(() => dispatch(fetchCandidatesByGroup(groupId)));

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

  const openEditCandidate = (c) => {
    setEditCandForm({
      _id: String(c._id),
      name: c.name || '',
      description: c.description || '',
      symbol: c.symbol || '',
      photoUrl: c.photoUrl || '',
    });
    setEditCandErrors({});
    setEditCandOpen(true);
  };

  const onEditCandChange = (e) => {
    const { name, value } = e.target;
    setEditCandForm((prev) => ({ ...prev, [name]: value }));
    setEditCandErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSaveEditedCandidate = async (e) => {
    e.preventDefault();
    const { _id, name, description, symbol, photoUrl } = editCandForm;

    if (!name?.trim()) {
      toast.error('שם מועמד/ת חובה');
    }

    const errors = validateCandidateFields({ name, description, symbol });
    setEditCandErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const patch = {
      name: name.trim(),
      description: (description || '').trim(),
      symbol: (symbol || '').trim(),
      photoUrl: (photoUrl || '').trim(),
    };

    try {
      await dispatch(
        updateCandidate({ candidateId: _id, groupId, patch }),
      ).unwrap();
      setEditCandOpen(false);
      setEditCandErrors({});
      dispatch(fetchCandidatesByGroup(groupId));
    } catch (err) {
      toast.error(err || 'עדכון נכשל');
    }
  };

  const onCancelEditCandidate = () => {
    setEditCandOpen(false);
    setEditCandErrors({});
  };

  async function handleUpload(file, mode, oldUrl = '') {
    if (!file) return;

    try {
      if (mode === 'new') setUploadingNew(true);
      if (mode === 'edit') setUploadingEdit(true);

      const url = await uploadImage(file, oldUrl);
      if (!url) return null;

      if (mode === 'new') {
        setCandForm((prev) => ({ ...prev, photoUrl: url }));
      }

      if (mode === 'edit') {
        setEditCandForm((prev) => ({ ...prev, photoUrl: url }));
      }

      return url;
    } catch (err) {
      console.error('Upload error:', err);
      alert('שגיאה בהעלאת הקובץ');
      return null;
    } finally {
      if (mode === 'new') setUploadingNew(false);
      if (mode === 'edit') setUploadingEdit(false);
    }
  }


  const clearNewPhoto = () =>
    setCandForm((prev) => ({ ...prev, photoUrl: '' }));
  const clearEditPhoto = () =>
    setEditCandForm((prev) => ({ ...prev, photoUrl: '' }));

  const handleApproveJoin = (r) =>
    dispatch(approveJoinRequest({ groupId, requestId: r._id }))
      .unwrap()
      .then(() => {
        const uid = getReqUserId(r);
        if (uid)
          dispatch(
            upsertUsers({
              _id: uid,
              name: r.name,
              email: r.email,
            }),
          );
        dispatch(fetchJoinRequests(groupId));
        dispatch(fetchGroupWithMembers(groupId));
      });

  const handleRejectJoin = (r) =>
    dispatch(rejectJoinRequest({ groupId, requestId: r._id }))
      .unwrap()
      .then(() => {
        dispatch(fetchJoinRequests(groupId));
        dispatch(fetchGroupWithMembers(groupId));
      });

  const handleRemoveMember = (m, mid) => {
    setSelectedMember({ member: m, memberId: mid });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    const { member, memberId } = selectedMember;
    setShowConfirm(false);

    try {
      await dispatch(
        removeGroupMember({
          groupId,
          memberId,
          email: member.email || undefined,
        }),
      ).unwrap();

      if (group.isLocked) dispatch(fetchJoinRequests(groupId));
      dispatch(fetchGroupWithMembers(groupId));
    } catch (e) {
      toast.error(e || 'Failed to remove member');
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSelectedMember(null);
  };

  // ---------- JSX ----------

  return (
    <div className="gs-wrap">

      {/* <div className="gs-header">
        <h2>הגדרות קבוצה</h2>
        <div className="gs-actions">
          <button className="gs-btn" onClick={() => navigate('/groups')}>
            לרשימת הקבוצות
          </button>

          <button
            className="gs-btn"
            onClick={() =>
              navigate(`/groups/${slug}`, {
                state: { groupId },
              })
            }
          >
            פרטי הקבוצה
          </button>
        </div>
      </div> */}

      <div className="gs-header clean-header">


        {/* כותרת מרכזית */}
        <div className="header-title">
          <h2>{group.name}</h2>
          <p>{group.description}</p>
        </div>

        {/* כפתור פרטי הקבוצה */}
        <button
          className="icon-btn"
          onClick={() =>
            navigate(`/groups/${slug}`, {
              state: { groupId },
            })
          }
          title="פרטי הקבוצה"
        >
          <FaInfoCircle size={24} />
        </button>

        {/* כפתור חזרה */}
        <button
          className="icon-btn"
          onClick={() => navigate('/groups')}
          title="חזרה לקבוצות"
        >
          <BiArrowBack size={24} />
        </button>
      </div>




      {/* layout: תוכן משמאל + סיידבר מימין */}
      <div className="gs-main-layout">
        {/* תוכן הטאב */}
        <div className="gs-tab-panel">
          {activeTab === 'general' && (
            <GeneralTab
              group={group}
              form={form}
              editMode={editMode}
              onEditClick={() => setEditMode(true)}
              onGroupChange={onGroupChange}
              onSaveGroup={onSaveGroup}
              onCancelEdit={onCancelEdit}
              shareUrl={shareUrl}
              prettyShareUrl={prettyShareUrl}
              copied={copied}
              copyShareUrl={copyShareUrl}
              updateError={updateError}
              updateSuccess={updateSuccess}
              updateLoading={updateLoading}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesTab
              candidates={candidates}
              candLoading={candLoading}
              candError={candError}
              candForm={candForm}
              candErrors={candErrors}
              setCandForm={setCandForm}
              setCandErrors={setCandErrors}
              onAddCandidate={onAddCandidate}
              onDeleteCandidate={handleDeleteCandidateClick}
              onOpenEditCandidate={openEditCandidate}
              uploadingNew={uploadingNew}
              onUploadNew={(file) => handleUpload(file, 'new')}
              newFileInputRef={newFileInputRef}
              clearNewPhoto={clearNewPhoto}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidateRequestsTab
              groupId={groupId}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}



          {activeTab === 'voters' && (
            <VotersTab
              voters={voters}
              votersLoading={votersLoading}
              votersError={votersError}
              formatVoterTitle={formatVoterTitle}
            />
          )}

          {activeTab === 'members' && group.isLocked && (
            <>
              <MembersTab
                group={group}
                enrichedMembers={enrichedMembers}
                isOwner={isOwnerOrAdmin}
                onRemoveMember={handleRemoveMember}
              />

              <JoinRequestsTab
                groupId={groupId}
                reqs={reqs}
                reqsLoading={reqsLoading}
                reqsError={reqsError}
                onApprove={handleApproveJoin}
                onReject={handleRejectJoin}
              />
            </>
          )}


          {activeTab === 'danger' && (
            <DangerTab
              onOpenDelete={() => {
                setDeleteOpen(true);
                setTypedSlug('');
              }}
            />
          )}
        </div>

        {/* סיידבר הניווט מימין */}

        <aside className="gs-sidebar-tabs">
          <button
            className={`side-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FaInfoCircle style={{ marginInlineEnd: 6 }} />
            פרטי קבוצה
          </button>

          <button
            className={`side-tab ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            <FaUserPlus style={{ marginInlineEnd: 6 }} />
            מועמדים
          </button>

          <button
            className={`side-tab ${activeTab === 'voters' ? 'active' : ''}`}
            onClick={() => setActiveTab('voters')}
          >
            <FaUserCheck style={{ marginInlineEnd: 6 }} />
            מצביעים
          </button>

          {group.isLocked && (
            <button
              className={`side-tab ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              <FaUsers style={{ marginInlineEnd: 6 }} />
              משתתפי הקבוצה  
            </button>
          )}



          <button
            className={`side-tab danger ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
            <FaExclamationTriangle style={{ marginInlineEnd: 6 }} />
            מחיקה
          </button>
        </aside>
      </div>

      {/* מודאל מחיקת קבוצה */}
      <DeleteGroupModal
        open={deleteOpen}
        confirmSlug={confirmSlug}
        typedSlug={typedSlug}
        setTypedSlug={setTypedSlug}
        onClose={() => setDeleteOpen(false)}
        onDelete={doDeleteGroup}
      />

      {/* מודאל עריכת מועמד/ת */}
      <EditCandidateModal
        open={editCandOpen}
        editCandForm={editCandForm}
        editCandErrors={editCandErrors}
        updatingThisCandidate={updatingCurrentCandidate}
        updateCandidateError={updateCandidateError}
        onEditCandChange={onEditCandChange}
        onSaveEditedCandidate={onSaveEditedCandidate}
        onCancelEditCandidate={onCancelEditCandidate}
        uploadingEdit={uploadingEdit}
        onUploadEdit={(file) => handleUpload(file, 'edit')}
        editFileInputRef={editFileInputRef}
        clearEditPhoto={clearEditPhoto}
      />

      <ConfirmModal
        open={showConfirm}
        message={
          selectedMember
            ? `להסיר את ${selectedMember.member.name ||
            selectedMember.member.email ||
            selectedMember.memberId
            } מהקבוצה?`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ConfirmModal
  open={showDeleteConfirm}
  message={
    selectedCandidate
      ? `להסיר את ${selectedCandidate.name || selectedCandidate.symbol || '(ללא שם)'}?`
      : ''
  }
  onConfirm={confirmDeleteCandidate}
  onCancel={() => setShowDeleteConfirm(false)}
/>

    </div>
  );
}
