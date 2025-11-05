const express = require('express');
const router = express.Router();
const {
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateById,
  getCandidatesByGroup,
  incrementVotes
} = require('../controllers/candidate_controller');

router.post('/create', createCandidate);               // יצירת מועמד
router.put('/:id', updateCandidate);                  // עדכון מועמד
router.delete('/:id', deleteCandidate);              // מחיקת מועמד
router.get('/:id', getCandidateById);                // קבלת מועמד לפי ID
router.get('/group/:groupId', getCandidatesByGroup); // קבלת כל מועמדים של קבוצה
router.post('/:id/votes', incrementVotes);           // להוסיף הצבעות למועמד

module.exports = router;
