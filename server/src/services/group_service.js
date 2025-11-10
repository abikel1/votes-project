const mongoose = require('mongoose');              // ✅ חשוב!
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
  return Group.findById(groupId)
    .populate('candidates')
    .populate({ path: 'members', select: 'name email' });
}

async function getAllGroupsService() {
  return Group.find().populate('candidates');
}

/* ===== בקשות הצטרפות ===== */

async function requestJoinGroupService(groupId, user) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (!g.isLocked) throw new Error('Group is not locked');

  // כבר חבר?
  if (g.members?.some(id => String(id) === String(user._id))) return g;
  if (Array.isArray(g.participants) && g.participants.includes(user.email)) return g;

  // קיימת בקשה ממתינה?
  const exists = g.joinRequests?.find(r =>
    String(r.userId) === String(user._id) && r.status === 'pending'
  );
  if (exists) return g;

  g.joinRequests.push({
    userId: user._id,
    email: (user.email || '').trim().toLowerCase(),
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
  return (g.joinRequests || []).filter(r => r.status === 'pending');
}

async function setJoinRequestStatusService(groupId, ownerId, reqId, status) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId)) throw new Error('Not owner');

  const req = g.joinRequests.id(reqId);
  if (!req) throw new Error('Request not found');

  if (status === 'approved') {
    if (!g.members) g.members = [];
    if (!g.members.some(id => String(id) === String(req.userId))) {
      g.members.push(req.userId);
    }
    if (!Array.isArray(g.participants)) g.participants = [];
    const emailNorm = (req.email || '').trim().toLowerCase();
    if (emailNorm && !g.participants.map(e => (e || '').trim().toLowerCase()).includes(emailNorm)) {
      g.participants.push(emailNorm);
    }
    req.deleteOne();
  } else if (status === 'rejected') {
    req.deleteOne();
  } else {
    req.status = status;
  }

  await g.save();
  return g;
}

/** אילו קבוצות המשתמש יצר ואילו הוא חבר בהן */
async function getUserGroupsService(user) {
  if (!user || !user.email) throw new Error('User email is required');
  const email = (user.email || '').trim().toLowerCase();
  const userId = user._id;

  const created = await Group.find({ createdBy: email }).lean();
  const joinedByMembers = await Group.find({ members: userId }).lean();
  const joinedByParticipants = await Group.find({ participants: email }).lean();

  const uniq = new Map();
  for (const g of [...joinedByMembers, ...joinedByParticipants]) uniq.set(String(g._id), g);
  const joined = Array.from(uniq.values());

  return { created, joined };
}

/** סטטוסים ממתינים שלי: { pending: [groupId,..] } */
async function getMyJoinStatusesService(user) {
  if (!user) throw new Error('User required');

  const orConds = [];
  if (user._id && mongoose.isValidObjectId(user._id)) {
    orConds.push({ joinRequests: { $elemMatch: { userId: new mongoose.Types.ObjectId(user._id), status: 'pending' } } });
  }
  if (user.email) {
    orConds.push({ joinRequests: { $elemMatch: { email: (user.email || '').trim().toLowerCase(), status: 'pending' } } });
  }

  if (!orConds.length) return { pending: [] };

  const rows = await Group.find({ $or: orConds }, { _id: 1 }).lean();
  return { pending: rows.map(r => String(r._id)) };
}

/** חברות בקבוצה מסוימת */
async function isMemberOfGroupService(groupId, user) {
  if (!user) throw new Error('User required');
  const g = await Group.findById(groupId).lean();
  if (!g) throw new Error('Group not found');

  const uid = String(user._id || '');
  const email = (user.email || '').trim().toLowerCase();

  const byMembers = Array.isArray(g.members) && g.members.some(id => String(id) === uid);
  const byParticipants = Array.isArray(g.participants) && g.participants
    .map(e => (e || '').trim().toLowerCase())
    .includes(email);

  return { member: !!(byMembers || byParticipants) };
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
  getMyJoinStatusesService,
  isMemberOfGroupService,
};
