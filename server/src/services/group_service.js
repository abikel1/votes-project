const Group = require('../models/group_model');

function toBoolStrict(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return null;
}

async function createGroupService(data, user) {
  if (!user || !user.email) throw new Error('Missing user.email');
  const parsedIsLocked = toBoolStrict(data.isLocked);
  if (parsedIsLocked === null) { const err = new Error('MISSING_IS_LOCKED'); err.code = 'MISSING_IS_LOCKED'; throw err; }

  const group = await Group.create({
    name: data.name,
    description: data.description,
    createdBy: user.email,
    createdById: user._id,
    endDate: data.endDate,
    maxWinners: data.maxWinners ?? 1,
    shareLink: data.shareLink || undefined,
    isLocked: parsedIsLocked,
  });
  return group;
}

async function updateGroupService(groupId, updateData) {
  if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'isLocked')) {
    const v = toBoolStrict(updateData.isLocked);
    if (v !== null) updateData.isLocked = v;
  }
  return Group.findByIdAndUpdate(groupId, updateData, { new: true, runValidators: true });
}

async function deleteGroupService(groupId) {
  return Group.findByIdAndDelete(groupId);
}

async function getGroupByIdService(groupId) {
  // ⬅️ נוסיף פופולייט ל-members כדי להציג במסך ההגדרות
  return Group.findById(groupId)
    .populate('candidates')
    .populate({ path: 'members', select: 'name email' });
}

async function getAllGroupsService() {
  return Group.find().populate('candidates');
}

// <<<<<<< HEAD
/* ===== בקשות הצטרפות ===== */

async function requestJoinGroupService(groupId, user) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (!g.isLocked) throw new Error('Group is not locked');

  if (g.members?.some(id => String(id) === String(user._id))) return g;

  const exists = g.joinRequests?.find(r =>
    String(r.userId) === String(user._id) && r.status === 'pending'
  );
  if (exists) return g;

  g.joinRequests.push({
    userId: user._id,
    email: user.email,
    name: user.name || user.fullName || '',
    status: 'pending',
  });

  await g.save();
  return g;
}

async function listJoinRequestsService(groupId, ownerId) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId)) throw new Error('Not owner');
  // ⬅️ מחזירים רק ממתינים
  return (g.joinRequests || []).filter(r => r.status === 'pending');
}

async function setJoinRequestStatusService(groupId, ownerId, reqId, status) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId)) throw new Error('Not owner');

  const req = g.joinRequests.id(reqId);
  if (!req) throw new Error('Request not found');

  if (status === 'approved') {
    // מוסיפים לרשימת חברים (אם לא קיים)
    if (!g.members) g.members = [];
    if (!g.members.some(id => String(id) === String(req.userId))) {
      g.members.push(req.userId);
    }
    // מסירים את הבקשה (מועבר ל"משתתפי הקבוצה")
    req.deleteOne();
  } else if (status === 'rejected') {
    // דחייה מוחקת לגמרי
    req.deleteOne();
  } else {
    // אם בעתיד תרצי סטטוסים נוספים
    req.status = status;
  }

  await g.save();
  return g;
// =======
async function getUserGroupsService(userEmail) {
  if (!userEmail) throw new Error('User email is required');

  // קבוצות שהמשתמש יצר
  const created = await Group.find({ createdBy: userEmail }).lean();

  // קבוצות שהמשתמש משתתף בהן
  const joined = await Group.find({ participants: userEmail }).lean();

  return { created, joined };
}
}
module.exports = {
  createGroupService,
  updateGroupService,
  deleteGroupService,
  getGroupByIdService,
  getAllGroupsService,
  requestJoinGroupService,
  listJoinRequestsService,
  setJoinRequestStatusService,
  getUserGroupsService,
};
