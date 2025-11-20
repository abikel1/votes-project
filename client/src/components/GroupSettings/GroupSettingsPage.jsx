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
  selectJoinRequestsError,
} from '../../slices/joinRequestsSlice';

import {
  fetchVotersByGroup,
  selectVotersForGroup,
  selectVotersLoadingForGroup,
  selectVotersErrorForGroup,
} from '../../slices/votesSlice';

import { upsertUsers } from '../../slices/usersSlice';
import ConfirmModal  from '../../components/ConfirmModal/ConfirmModal'
import GeneralTab from './GeneralTab';
import CandidatesTab from './CandidatesTab';
import VotersTab from './VotersTab';
import JoinRequestsTab from './JoinRequestsTab';
import MembersTab from './MembersTab';
import DangerTab from './DangerTab';
import EditCandidateModal from './EditCandidateModal';
import DeleteGroupModal from './DeleteGroupModal';

import './GroupSettingsPage.css';

import {
  EMPTY_ARR,
  makeSlug,
  toLocalDateInputValue,
  getReqUserId,
  humanizeName,
  validateCandidateFields,
} from './groupSettingsHelpers';
 
// ---------- קומפוננטה ראשית ----------

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
  const { userId, userEmail, firstName, lastName } = useSelector((s) => s.auth);

  const candidates = useSelector(selectCandidatesForGroup(groupId)) || EMPTY_ARR;
  const candLoading = useSelector(selectCandidatesLoadingForGroup(groupId));
  const candError = useSelector(selectCandidatesErrorForGroup(groupId));


  const [showConfirm, setShowConfirm] = useState(false);
const [selectedMember, setSelectedMember] = useState(null);


  const reqs = useSelector(selectJoinRequestsForGroup(groupId)) || EMPTY_ARR;
  const reqsLoading = useSelector(selectJoinRequestsLoading(groupId));
  const reqsError = useSelector(selectJoinRequestsError(groupId));

  const voters = useSelector(selectVotersForGroup(groupId)) || EMPTY_ARR;
  const votersLoading = useSelector(selectVotersLoadingForGroup(groupId));
  const votersError = useSelector(selectVotersErrorForGroup(groupId));

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

  // שיתוף
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupWithMembers(groupId));
    dispatch(fetchCandidatesByGroup(groupId));
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
      group?.createdById && userId && String(group.createdById) === String(userId);

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

  // ---------- הגנות ----------

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
        <button className="gs-btn" onClick={() => navigate(-1)}>
          חזרה
        </button>
      </div>
    );
  }

  // ---------- handlers ----------

  const onGroupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'maxWinners' ? Number(value) : type === 'checkbox' ? checked : value,
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

    dispatch(createCandidate({ groupId, ...candForm }))
      .unwrap()
      .then(() => {
        setCandForm({ name: '', description: '', symbol: '', photoUrl: '' });
        setCandErrors({});
      })
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
      await dispatch(updateCandidate({ candidateId: _id, groupId, patch })).unwrap();
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

      const fd = new FormData();
      fd.append('image', file);
      if (oldUrl) fd.append('old', oldUrl);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      if (mode === 'new') {
        setCandForm((prev) => ({ ...prev, photoUrl: data.url }));
      }

      if (mode === 'edit') {
        setEditCandForm((prev) => ({ ...prev, photoUrl: data.url }));
      }

      return data.url;
    } catch (err) {
      console.error('Upload error:', err);
      alert('שגיאה בהעלאת הקובץ');
      return null;
    } finally {
      if (mode === 'new') setUploadingNew(false);
      if (mode === 'edit') setUploadingEdit(false);
    }
  }

  const clearNewPhoto = () => setCandForm((prev) => ({ ...prev, photoUrl: '' }));
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

  // const handleRemoveMember = async (m, mid) => {
  //   const name = m.name || m.email || mid;

  //   if (!window.confirm(`להסיר את ${name} מהקבוצה?`)) return;

  //   try {
  //     await dispatch(
  //       removeGroupMember({
  //         groupId,
  //         memberId: mid,
  //         email: m.email || undefined,
  //       }),
  //     ).unwrap();
  //     if (group.isLocked) dispatch(fetchJoinRequests(groupId));
  //     dispatch(fetchGroupWithMembers(groupId));
  //   } catch (e) {
  //     toast.error(e || 'Failed to remove member');
  //   }
  // };

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
      })
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



  return (
    <div className="gs-wrap">
      <div className="gs-header">
        <h2>הגדרות קבוצה</h2>
        <div className="gs-actions">
          <button className="gs-btn" onClick={() => navigate('/groups')}>
            לרשימת הקבוצות
          </button>
        </div>
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
              onDeleteCandidate={onDeleteCandidate}
              onOpenEditCandidate={openEditCandidate}
              uploadingNew={uploadingNew}
              onUploadNew={(file) => handleUpload(file, 'new')}
              newFileInputRef={newFileInputRef}
              clearNewPhoto={clearNewPhoto}
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

          {activeTab === 'join' && group.isLocked && (
            <JoinRequestsTab
              groupId={groupId}
              reqs={reqs}
              reqsLoading={reqsLoading}
              reqsError={reqsError}
              onApprove={handleApproveJoin}
              onReject={handleRejectJoin}
            />
          )}

          {activeTab === 'members' && group.isLocked && (
            <MembersTab
              group={group}
              enrichedMembers={enrichedMembers}
              isOwner={isOwner}
              onRemoveMember={handleRemoveMember}
            />
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
            פרטי קבוצה
          </button>

          <button
            className={`side-tab ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            מועמדים
          </button>

          <button
            className={`side-tab ${activeTab === 'voters' ? 'active' : ''}`}
            onClick={() => setActiveTab('voters')}
          >
            מצביעים
          </button>

          {group.isLocked && (
            <>
              <button
                className={`side-tab ${activeTab === 'join' ? 'active' : ''}`}
                onClick={() => setActiveTab('join')}
              >
                בקשות הצטרפות
              </button>

              <button
                className={`side-tab ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                משתתפי הקבוצה
              </button>
            </>
          )}

          <button
            className={`side-tab danger ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
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
      ? `להסיר את ${selectedMember.member.name || selectedMember.member.email || selectedMember.memberId} מהקבוצה?`
      : ''
  }
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>

    </div>
  );
}
