const { createCandidateService } = require('../services/candidate_service');

async function createCandidate(req, res) {
  try {
    const candidateData = req.body;
    const candidate = await createCandidateService(candidateData);
    res.status(201).json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating candidate' });
  }
}

module.exports = { createCandidate };
