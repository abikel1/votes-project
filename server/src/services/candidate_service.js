const Candidate = require('../models/candidate_model');

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

module.exports = { createCandidateService };
