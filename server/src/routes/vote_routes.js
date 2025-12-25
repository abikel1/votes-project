const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth_middleware');

const {
  createVote,
  deleteVote,
  getVotesByCandidateInGroup,
  getVotersByGroup,
  hasVoted,
  getMyFinishedVotedGroups,
} = require('../controllers/vote_controller');

router.post('/create', createVote);
router.delete('/delete', deleteVote);
router.get('/by-candidate', getVotesByCandidateInGroup);
router.get('/group/:groupId/voters', getVotersByGroup);
router.get('/has-voted', hasVoted);
router.get('/my-finished', auth, getMyFinishedVotedGroups);

module.exports = router;
