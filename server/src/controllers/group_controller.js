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

} = require('../services/group_service');
const Group = require('../models/group_model'); // ✅

async function createGroup(req, res) {
  try {
    const group = await createGroupService(req.body, req.user);
    res.status(201).json(group);
  } catch (err) {
    if (err.code === 'MISSING_IS_LOCKED') {
      return res.status(400).json({ message: 'שדה isLocked חובה (true/false)' });
    }
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
}

async function updateGroup(req, res) {
  try {
    const group = await updateGroupService(req.params.id, req.body);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Error updating group', error: err.message });
  }
}

async function deleteGroup(req, res) {
  try {
    const group = await deleteGroupService(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting group', error: err.message });
  }
}

async function getGroupById(req, res) {
  try {
    const group = await getGroupByIdService(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Error getting group', error: err.message });
  }
}

async function getAllGroups(req, res) {
  try {
    const groups = await getAllGroupsService();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Error getting groups', error: err.message });
  }
}

// <<<<<<< HEAD
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
    res.json(list); // רק 'pending'
  } catch (err) {
    const code = err.message === 'Not owner' ? 403 : (err.message === 'Group not found' ? 404 : 400);
    res.status(code).json({ message: err.message });
  }
}

async function approveJoinRequest(req, res) {
  try {
    await setJoinRequestStatusService(req.params.id, req.user._id, req.params.reqId, 'approved');
    // מחזירות את הרשימה העדכנית (pending בלבד)
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
// ✅ חדש: החזרת חברי הקבוצה (objects עם name,email,...)
async function getGroupMembers(req, res) {
  try {
    const g = await Group.findById(req.params.id)
      .populate({ path: 'members', select: 'name email phone address' });
    if (!g) return res.status(404).json({ message: 'Group not found' });
    res.json(g.members || []);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }}

  // =======
async function getUserGroups(req, res) {
  try {
    const email = req.user.email; // ← auth מבטיח שיש req.user
    const groups = await getUserGroupsService(email);
    res.json(groups); // { created: [...], joined: [...] }
  } catch (err) {
    console.error('❌ Error getting user groups:', err);
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
  getGroupMembers, // ✅
  getUserGroups,  // ← ודאי שמייצאים
};



