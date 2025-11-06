const Group = require('../models/group_model');

async function createGroupService(data, user) {
  if (!user || !user.email) {
    // עצירה מכוונת: אם תגיעי לפה — ה-route לא עבר דרך auth או req.user ריק
    throw new Error('Missing user.email on createGroupService – route must use auth() and req.user must include email');
  }
  console.log('[SRV] createGroupService user=', user); // ← LOG
  const group = await Group.create({
    name: data.name,
    description: data.description,
    createdBy: user.email,
    createdById: user._id,
    endDate: data.endDate,
    maxWinners: data.maxWinners ?? 1,
    shareLink: data.shareLink || undefined,
  });
  console.log('[SRV] created group _id=', group._id, ' createdBy=', group.createdBy); // ← LOG
  return group;
}


async function updateGroupService(groupId, updateData) {
  return Group.findByIdAndUpdate(groupId, updateData, { new: true });
}

async function deleteGroupService(groupId) {
  return Group.findByIdAndDelete(groupId);
}

async function getGroupByIdService(groupId) {
  return Group.findById(groupId).populate('candidates');
}

async function getAllGroupsService() {
  return Group.find().populate('candidates');
}

module.exports = {
  createGroupService,
  updateGroupService,
  deleteGroupService,
  getGroupByIdService,
  getAllGroupsService,
};
