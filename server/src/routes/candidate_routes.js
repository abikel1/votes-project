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

   applyCandidate,
  approveCandidate,
  addCandidateByEmail,
  getCandidateCampaign
} = require('../controllers/candidate_controller');

router.post('/create', createCandidate);               // יצירת מועמד
router.put('/:id', updateCandidate);                  // עדכון מועמד
router.delete('/:id', deleteCandidate);              // מחיקת מועמד
router.get('/:id', getCandidateById);                // קבלת מועמד לפי ID
router.get('/group/:groupId', getCandidatesByGroup); // קבלת כל מועמדים של קבוצה
router.post('/:id/votes', incrementVotes);           // להוסיף הצבעות למועמד



// 1️⃣ משתמש מגיש בקשת מועמדות
router.post('/groups/:id/candidates/apply',auth, applyCandidate);

// 2️⃣ מנהל מאשר / דוחה (כרגע רק approve)
router.post('/groups/:id/candidates/approve/:requestId',auth,  approveCandidate);

// 3️⃣ מנהל מוסיף לפי מייל
router.post('/groups/:id/candidates/add-by-email',auth,  addCandidateByEmail);


module.exports = router;
