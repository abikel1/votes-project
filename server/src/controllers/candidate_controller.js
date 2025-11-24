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
  rejectCandidateRequestService ,
  addCandidateByEmailService,
  getCandidateCampaignService
} = require('../services/group_service');


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

// 1️⃣ משתמש מגיש בקשת מועמדות
async function applyCandidate(req, res) {
  try {
    const out = await applyCandidateService(req.params.id, req.user, req.body);
    res.json({ ok: true, group: out });
    console.log('req.user = ', req.user);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
// 1️⃣ מנהל מאשר דוחה  בקשת מועמדות

async function rejectCandidate(req, res) {
    console.log("req.params", req.params)

  try {
    await rejectCandidateRequestService(
      req.params.id,
      req.user._id,
      req.params.requestId
    );

    res.json({
      ok: true,
      requestId: req.params.requestId,
      groupId: req.params.id
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


async function approveCandidate(req, res) {
  try {
    const c = await approveCandidateRequestService(
      req.params.id,
      req.user._id,
      req.params.requestId
    );

    res.json({
      ok: true,
      candidate: c,
      requestId: req.params.requestId,
      groupId: req.params.id
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


// 3️⃣ הוספה לפי מייל
async function addCandidateByEmail(req, res) {
  try {
    const c = await addCandidateByEmailService(
      req.params.id,
      req.user._id,
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
