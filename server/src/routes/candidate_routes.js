const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth_middleware');

const {
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateById,
  getCandidatesByGroup,
  incrementVotes,
  rejectCandidate,
  applyCandidate,
  approveCandidate,
  addCandidateByEmail,
} = require('../controllers/candidate_controller');

// CRUD בסיסי על מועמדים
router.post('/create', createCandidate);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);
router.get('/:id', getCandidateById);
router.get('/group/:groupId', getCandidatesByGroup);
router.post('/:id/votes', incrementVotes);

// בקשות מועמדות ע"י משתמשים
router.post('/:id/applyCandidate', auth, applyCandidate);

// מנהל מאשר / דוחה בקשה
router.post('/:id/approveCandidates/:requestId', auth, approveCandidate);
router.post('/:id/rejectCandidates/:requestId', auth, rejectCandidate);

// מנהל מוסיף מועמד לפי מייל
router.post('/groups/:id/candidates/add-by-email', auth, addCandidateByEmail);

module.exports = router;
