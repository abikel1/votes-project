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

router.post('/create', createCandidate);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);
router.get('/:id', getCandidateById);
router.get('/group/:groupId', getCandidatesByGroup);
router.post('/:id/votes', incrementVotes);
router.post('/:id/applyCandidate', auth, applyCandidate);
router.post('/:id/approveCandidates/:requestId', auth, approveCandidate);
router.post('/:id/rejectCandidates/:requestId', auth, rejectCandidate);
router.post('/groups/:id/candidates/add-by-email', auth, addCandidateByEmail);

module.exports = router;
