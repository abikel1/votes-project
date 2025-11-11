const express = require('express');
const router = express.Router();

const {
  createVote,
  deleteVote,
  getVotesByCandidateInGroup,
  getVotersByGroup,
  hasVoted,
} = require('../controllers/vote_controller');

// יצירת/מחיקת הצבעה
router.post('/create', createVote);
router.delete('/delete', deleteVote);

// שאילתות
router.get('/by-candidate', getVotesByCandidateInGroup);   // ?candidateId=&groupId=
router.get('/group/:groupId/voters', getVotersByGroup);    // רשימת מצביעים בקבוצה
router.get('/has-voted', hasVoted);                        // ?userId=&groupId=

module.exports = router;
