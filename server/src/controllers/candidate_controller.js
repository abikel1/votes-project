const {
  createCandidateService,
  updateCandidateService,
  deleteCandidateService,
  getCandidateByIdService,
  getCandidatesByGroupService,
  incrementVotesService
} = require('../services/candidate_service');

const {
  applyCandidateService,
  approveCandidateRequestService,
  rejectCandidateRequestService,
  addCandidateByEmailService,

} = require('../services/group_service');

const Campaign = require('../models/campaign_model');

async function createCandidate(req, res) {
  try {
    const candidate = await createCandidateService(req.body);
    res.status(201).json(candidate);
  } catch (err) {
    console.error('❌ Error creating candidate:', err);
    res.status(500).json({ message: 'Error creating candidate', error: err.message });
  }
}

async function updateCandidate(req, res) {
  try {
    const candidate = await updateCandidateService(req.params.id, req.body);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    console.error('❌ Error updating candidate:', err);
    res.status(500).json({ message: 'Error updating candidate', error: err.message });
  }
}

async function deleteCandidate(req, res) {
  try {
    const candidate = await deleteCandidateService(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting candidate:', err);
    res.status(500).json({ message: 'Error deleting candidate', error: err.message });
  }
}

async function getCandidateById(req, res) {
  try {
    const candidate = await getCandidateByIdService(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    const campaign = await Campaign.findOne({ candidate: req.params.id }).lean();
    candidate.campaign = campaign || null;

    res.json(candidate);
  } catch (err) {
    console.error('❌ Error getting candidate:', err);
    res.status(500).json({ message: 'Error getting candidate', error: err.message });
  }
}
async function getCandidatesByGroup(req, res) {
  try {
    const candidates = await getCandidatesByGroupService(req.params.groupId);
    res.json(candidates);
  } catch (err) {
    console.error('❌ Error getting candidates:', err);
    res.status(500).json({ message: 'Error getting candidates', error: err.message });
  }
}

async function incrementVotes(req, res) {
  try {
    const candidate = await incrementVotesService(req.params.id, req.body.count);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    console.error('❌ Error incrementing votes:', err);
    res.status(500).json({ message: 'Error incrementing votes', error: err.message });
  }
}

async function applyCandidate(req, res) {
  try {
    const out = await applyCandidateService(req.params.id, req.user, req.body);

    res.json({
      ok: true,
      groupId: out.groupId,
      request: out.request,
    });
  } catch (err) {
    console.error('❌ Error applying as candidate:', err);
    res.status(400).json({ message: err.message, code: err.code });
  }
}

async function rejectCandidate(req, res) {
  try {
    const ownerId = req.user.isAdmin ? 'ADMIN' : req.user._id;

    const out = await rejectCandidateRequestService(
      req.params.id,
      ownerId,
      req.params.requestId
    );

    res.json({
      ok: true,
      groupId: out.groupId,
      request: out.request,
    });
  } catch (err) {
    console.error('❌ Error rejecting candidate request:', err);
    res.status(400).json({ message: err.message });
  }
}

async function approveCandidate(req, res) {
  try {
    const ownerId = req.user.isAdmin ? 'ADMIN' : req.user._id;

    const out = await approveCandidateRequestService(
      req.params.id,
      ownerId,
      req.params.requestId
    );

    res.json({
      ok: true,
      groupId: out.groupId,
      request: out.request,
      candidate: out.candidate,
    });
  } catch (err) {
    console.error('❌ Error approving candidate request:', err);
    res.status(400).json({ message: err.message });
  }
}

async function addCandidateByEmail(req, res) {
  try {
    const ownerId = req.user.isAdmin ? 'ADMIN' : req.user._id;

    const c = await addCandidateByEmailService(
      req.params.id,
      ownerId,
      req.body.email,
      req.body
    );
    res.json({ ok: true, candidate: c });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateById,
  getCandidatesByGroup,
  incrementVotes,
  applyCandidate,
  approveCandidate,
  rejectCandidate,
  addCandidateByEmail,
};
