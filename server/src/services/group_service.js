
const Group = require('../models/group_model');
const Candidate = require('../models/candidate_model');

async function createGroupWithCandidates(groupData, candidatesData) {
  // יוצרים את הקבוצה
  const group = new Group({
    name: groupData.name,
    description: groupData.description,
    createdBy: groupData.createdBy,
    endDate: groupData.endDate,
    maxWinners: groupData.maxWinners,
    shareLink: groupData.shareLink
  });

  await group.save();

  // יוצרים את המועמדים ומקשרים לקבוצה
  const candidates = await Promise.all(candidatesData.map(async (cand) => {
    const candidate = new Candidate({
      name: cand.name,
      description: cand.description,
      photoUrl: cand.photoUrl,
      symbol: cand.symbol,
      groupId: group._id
    });
    await candidate.save();
    return candidate._id;
  }));

  // מעדכנים את הקבוצה עם המועמדים
  group.candidates = candidates;
  await group.save();

  return group;
}

module.exports = {
  createGroupWithCandidates
};
