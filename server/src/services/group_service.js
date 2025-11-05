const Group = require('../models/group_model');

// יצירת קבוצה
async function createGroupService(groupData) {
  const group = new Group({
    name: groupData.name,
    description: groupData.description,
    createdBy: groupData.createdBy,
    endDate: groupData.endDate,
    maxWinners: groupData.maxWinners,
    shareLink: groupData.shareLink
  });
  await group.save();
  return group;
}

// עריכת קבוצה
async function updateGroupService(groupId, updateData) {
  const group = await Group.findByIdAndUpdate(groupId, updateData, { new: true });
  return group;
}

// מחיקת קבוצה
async function deleteGroupService(groupId) {
  const group = await Group.findByIdAndDelete(groupId);
  return group;
}

// קבלת קבוצה לפי ID
async function getGroupByIdService(groupId) {
  const group = await Group.findById(groupId).populate('candidates');
  return group;
}

// קבלת כל הקבוצות
async function getAllGroupsService() {
  const groups = await Group.find().populate('candidates');
  return groups;
}

module.exports = {
  createGroupService,
  updateGroupService,
  deleteGroupService,
  getGroupByIdService,
  getAllGroupsService
};
