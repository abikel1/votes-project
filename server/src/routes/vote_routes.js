const express = require('express');
const router = express.Router();
const { createVote } = require('../controllers/vote_controller');

router.post('/create', createVote);

module.exports = router;
