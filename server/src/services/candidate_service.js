// server/src/services/candidate_service.js
const Candidate = require('../models/candidate_model');
const Group = require('../models/group_model');
const Campaign = require('../models/campaign_model'); // 👈 להוסיף שורה זו

// יצירת מועמד
async function createCandidateService(candidateData) {
  const candidate = new Candidate({
    name: candidateData.name,
    description: candidateData.description,
    photoUrl: candidateData.photoUrl,
    symbol: candidateData.symbol,
    groupId: candidateData.groupId,
    userId: candidateData.userId || null,
  });

  await candidate.save();

  // לשמור גם במערך candidates של הקבוצה (אם יש groupId)
  if (candidate.groupId) {
    await Group.findByIdAndUpdate(
      candidate.groupId,
      { $addToSet: { candidates: candidate._id } },
      { new: true }
    );
  }

  return candidate;
}

// עדכון מועמד
async function updateCandidateService(candidateId, updateData) {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    updateData,
    { new: true }
  );
  return candidate;
}

// מחיקת מועמד
async function deleteCandidateService(candidateId) {
  // קודם נשלוף את המועמד כדי לדעת groupId ו-userId
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    return null;
  }

  // מחיקה ממערך המועמדים של הקבוצה
  if (candidate.groupId) {
    await Group.findByIdAndUpdate(
      candidate.groupId,
      { $pull: { candidates: candidate._id } },
      { new: true }
    );
  }

  // 👇 מחיקת הקמפיין של המועמד (אם קיים)
  await Campaign.deleteMany({ candidate: candidate._id });

  // מוחקים את המועמד עצמו
  await Candidate.findByIdAndDelete(candidateId);

  // מעדכנים את בקשת המועמדות בקבוצה ל־"removed"
  if (candidate.groupId && candidate.userId) {
    const g = await Group.findById(candidate.groupId);
    if (g && Array.isArray(g.candidateRequests)) {
      const req = g.candidateRequests.find(
        (r) => String(r.userId) === String(candidate.userId)
      );
      if (req) {
        req.status = 'removed';
        await g.save();
      }
    }
  }

  // מחזירים את המועמד שנמחק (אם תרצי להשתמש בזה בצד קונטרולר)
  return candidate;
}


// קבלת מועמד לפי ID
async function getCandidateByIdService(candidateId) {
  const candidate = await Candidate.findById(candidateId);
  return candidate;
}

// קבלת כל המועמדים של קבוצה מסוימת
async function getCandidatesByGroupService(groupId) {
  const candidates = await Candidate.find({ groupId });
  return candidates;
}

// ספירת הצבעות למועמד
async function incrementVotesService(candidateId, count = 1) {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    { $inc: { votesCount: count } },
    { new: true }
  );
  return candidate;
}

module.exports = {
  createCandidateService,
  updateCandidateService,
  deleteCandidateService,
  getCandidateByIdService,
  getCandidatesByGroupService,
  incrementVotesService,
};
