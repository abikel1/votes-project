const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth_middleware'); // 👈 להוסיף

const {
  createVote,
  deleteVote,
  getVotesByCandidateInGroup,
  getVotersByGroup,
  hasVoted,
  getMyFinishedVotedGroups, // 👈 להוסיף
} = require('../controllers/vote_controller');

// יצירת/מחיקת הצבעה
router.post('/create', createVote);
router.delete('/delete', deleteVote);

// שאילתות
router.get('/by-candidate', getVotesByCandidateInGroup);   // ?candidateId=&groupId=
router.get('/group/:groupId/voters', getVotersByGroup);    // רשימת מצביעים בקבוצה
router.get('/has-voted', hasVoted);                        // ?userId=&groupId=

// 👇 זה הראוט שחסר – זה מה שהקליינט קורא
router.get('/my-finished', auth, getMyFinishedVotedGroups);

module.exports = router;
