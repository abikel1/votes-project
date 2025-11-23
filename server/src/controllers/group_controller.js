const {
  createGroupService,
  updateGroupService,
  deleteGroupService,
  getGroupByIdService,
  getAllGroupsService,
  requestJoinGroupService,
  listJoinRequestsService,
  setJoinRequestStatusService,
  getUserGroupsService,
  getMyJoinStatusesService,
  isMemberOfGroupService,
  removeGroupMemberService,
  getCandidateRequestsService ,
} = require('../services/group_service');
const Group = require('../models/group_model');

async function createGroup(req, res) {
  try { const group = await createGroupService(req.body, req.user); res.status(201).json(group); }
  catch (err) {
    if (err.code === 'MISSING_IS_LOCKED') return res.status(400).json({ message: 'שדה isLocked חובה (true/false)' });
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
}

async function updateGroup(req, res) {
  try {
    const group = await updateGroupService(req.params.id, req.body);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) { res.status(500).json({ message: 'Error updating group', error: err.message }); }
}

async function deleteGroup(req, res) {
  try {
    // בדיקת בעלות לפני מחיקה
    const g = await Group.findById(req.params.id).lean();
    if (!g) return res.status(404).json({ message: 'Group not found' });
    if (String(g.createdById) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not owner' });
    }

    await deleteGroupService(req.params.id);
    // אפשר בעתיד להוסיף ניקוי ישויות תלויות במידלוואר.
    res.json({ ok: true, message: 'Group deleted successfully', deletedId: String(req.params.id) });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting group', error: err.message });
  }
}

async function getGroupById(req, res) {
  try {
    const group = await getGroupByIdService(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) { res.status(500).json({ message: 'Error getting group', error: err.message }); }
}

async function getAllGroups(req, res) {
  try { const groups = await getAllGroupsService(); res.json(groups); }
  catch (err) { res.status(500).json({ message: 'Error getting groups', error: err.message }); }
}

async function requestJoinGroup(req, res) {
  try {
    const g = await requestJoinGroupService(req.params.id, req.user);
    res.json(g);
  } catch (err) {
    const code = (err.message === 'Group not found') ? 404
      : (err.message === 'Group is not locked') ? 400
        : 400;
    res.status(code).json({ message: err.message || 'Join request failed' });
  }
}

async function listJoinRequests(req, res) {
  try {
    const list = await listJoinRequestsService(req.params.id, req.user._id);
    res.json(list);
  } catch (err) {
    const code = err.message === 'Not owner' ? 403 : (err.message === 'Group not found' ? 404 : 400);
    res.status(code).json({ message: err.message });
  }
}

async function approveJoinRequest(req, res) {
  try {
    await setJoinRequestStatusService(req.params.id, req.user._id, req.params.reqId, 'approved');
    const list = await listJoinRequestsService(req.params.id, req.user._id);
    res.json({ ok: true, pending: list });
  } catch (err) {
    const code = err.message === 'Not owner' ? 403 : (err.message === 'Group not found' ? 404 : 400);
    res.status(code).json({ message: err.message });
  }
}

async function rejectJoinRequest(req, res) {
  try {
    await setJoinRequestStatusService(req.params.id, req.user._id, req.params.reqId, 'rejected');
    const list = await listJoinRequestsService(req.params.id, req.user._id);
    res.json({ ok: true, pending: list });
  } catch (err) {
    const code = err.message === 'Not owner' ? 403 : (err.message === 'Group not found' ? 404 : 400);
    res.status(code).json({ message: err.message });
  }
}

async function getGroupMembers(req, res) {
  try {
    const g = await Group.findById(req.params.id)
      .populate({ path: 'members', select: 'name email phone address' });
    if (!g) return res.status(404).json({ message: 'Group not found' });
    res.json(g.members || []);
  } catch (err) { res.status(500).json({ message: err.message || 'Server error' }); }
}

async function getUserGroups(req, res) {
  try { const groups = await getUserGroupsService(req.user); res.json(groups); }
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function getMyJoinStatuses(req, res) {
  try { const out = await getMyJoinStatusesService(req.user); res.json(out); }
  catch (err) { res.status(500).json({ message: err.message || 'Server error' }); }
}

async function getMyMembership(req, res) {
  try {
    const out = await isMemberOfGroupService(req.params.id, req.user);
    res.json(out); // { member: boolean }
  } catch (err) {
    const code = err.message === 'Group not found' ? 404 : 400;
    res.status(code).json({ message: err.message || 'Server error' });
  }
}

/** הסרת משתתף/ת */
async function removeMember(req, res) {
  try {
    const { memberId, email } = req.body || {};
    if (!memberId && !email) {
      return res.status(400).json({ message: 'memberId or email is required' });
    }
    const g = await removeGroupMemberService(req.params.id, req.user._id, { memberId, email });
    const pending = await listJoinRequestsService(req.params.id, req.user._id).catch(() => []);
    res.json({ ok: true, group: g, pending });
  } catch (err) {
    const code = err.message === 'Not owner' ? 403
      : err.message === 'Group not found' ? 404
        : 400;
    res.status(code).json({ message: err.message || 'Remove member failed' });
  }
}

async function getCandidateRequests(req, res) {
  try {
    const requests = await getCandidateRequestsService(req.params.groupId);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getAllGroups,
  requestJoinGroup,
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getGroupMembers,
  getUserGroups,
  getMyJoinStatuses,
  getMyMembership,
  removeMember,
  getCandidateRequests,
};
