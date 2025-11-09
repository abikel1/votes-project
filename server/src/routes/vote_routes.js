// server/src/routes/vote_routes.js
const router = require('express').Router();
const auth = require('../middlewares/auth_middleware');
const { createVote, deleteVote, getVotesByCandidateInGroup } = require('../controllers/vote_controller');

// יצירת הצבעה: /api/votes/groups/:groupId/candidates/:candidateId/vote
router.post('/groups/:groupId/candidates/:candidateId/vote', auth, createVote);

// (נשאיר את השאר אם צריך)
router.delete('/delete', auth, deleteVote);
router.get('/by-candidate', auth, getVotesByCandidateInGroup);

module.exports = router;
