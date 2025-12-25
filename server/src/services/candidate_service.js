const Candidate = require('../models/candidate_model');
const Group = require('../models/group_model');
const Campaign = require('../models/campaign_model');

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

  if (candidate.groupId) {
    await Group.findByIdAndUpdate(
      candidate.groupId,
      { $addToSet: { candidates: candidate._id } },
      { new: true }
    );
  }

  return candidate;
}

async function updateCandidateService(candidateId, updateData) {
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    updateData,
    { new: true }
  );
  return candidate;
}

async function deleteCandidateService(candidateId) {
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    return null;
  }

  if (candidate.groupId) {
    await Group.findByIdAndUpdate(
      candidate.groupId,
      { $pull: { candidates: candidate._id } },
      { new: true }
    );
  }

  await Campaign.deleteMany({ candidate: candidate._id });
  await Candidate.findByIdAndDelete(candidateId);

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
  return candidate;
}

async function getCandidateByIdService(candidateId) {
  const candidate = await Candidate.findById(candidateId);
  return candidate;
}

async function getCandidatesByGroupService(groupId) {
  const candidates = await Candidate.find({ groupId });
  return candidates;
}

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
