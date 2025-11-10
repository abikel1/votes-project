const express = require('express');
const router = express.Router();
const {
  createVote,
  deleteVote,
  getVotesByCandidateInGroup,
} = require('../controllers/vote_controller');

// ללא auth בשלב זה; אם תרצי בהמשך – הוסיפי middleware
router.post('/create', createVote);
router.delete('/delete', deleteVote);
router.get('/by-candidate', getVotesByCandidateInGroup); // ?candidateId=&groupId=

module.exports = router;
