const Group = require('../models/group_model');

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
  console.log('✅ Group created:', group);
  return group;
}

module.exports = { createGroupService };
