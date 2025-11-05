const express = require('express');
const router = express.Router();
const { createVote, deleteVote } = require('../controllers/vote_controller');

router.post('/create', createVote);
router.delete('/delete', deleteVote);

module.exports = router;
