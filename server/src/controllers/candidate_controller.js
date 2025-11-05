const {
  createCandidateService,
  updateCandidateService,
  deleteCandidateService,
  getCandidateByIdService,
  getCandidatesByGroupService,
  incrementVotesService
} = require('../services/candidate_service');

// יצירת מועמד
async function createCandidate(req, res) {
  try {
    const candidate = await createCandidateService(req.body);
    res.status(201).json(candidate);
  } catch (err) {
    console.error('❌ Error creating candidate:', err);
    res.status(500).json({ message: 'Error creating candidate', error: err.message });
  }
}

// עדכון מועמד
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

// מחיקת מועמד
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

// קבלת מועמד לפי ID
async function getCandidateById(req, res) {
  try {
    const candidate = await getCandidateByIdService(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    console.error('❌ Error getting candidate:', err);
    res.status(500).json({ message: 'Error getting candidate', error: err.message });
  }
}

// קבלת כל המועמדים של קבוצה
async function getCandidatesByGroup(req, res) {
  try {
    const candidates = await getCandidatesByGroupService(req.params.groupId);
    res.json(candidates);
  } catch (err) {
    console.error('❌ Error getting candidates:', err);
    res.status(500).json({ message: 'Error getting candidates', error: err.message });
  }
}

// ספירת הצבעות למועמד
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

module.exports = {
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateById,
  getCandidatesByGroup,
  incrementVotes
};
