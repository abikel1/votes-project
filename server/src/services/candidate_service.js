const Candidate = require('../models/candidate_model');

// יצירת מועמד
async function createCandidateService(candidateData) {
  const candidate = new Candidate({
    name: candidateData.name,
    description: candidateData.description,
    photoUrl: candidateData.photoUrl,
    symbol: candidateData.symbol,
    groupId: candidateData.groupId
  });
  await candidate.save();
  return candidate;
}

// עדכון מועמד
async function updateCandidateService(candidateId, updateData) {
  const candidate = await Candidate.findByIdAndUpdate(candidateId, updateData, { new: true });
  return candidate;
}

// מחיקת מועמד
async function deleteCandidateService(candidateId) {
  const candidate = await Candidate.findByIdAndDelete(candidateId);
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
  incrementVotesService
};
