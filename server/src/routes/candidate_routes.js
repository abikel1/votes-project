const express = require('express');
const router = express.Router();
const { createCandidate } = require('../controllers/candidate_controller');

router.post('/', createCandidate); // 👈 שימי לב שאין "/api" כאן!

module.exports = router;
