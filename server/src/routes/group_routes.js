const express = require('express');
const router = express.Router();
const { createGroup } = require('../controllers/group_controller');

router.post('/create', createGroup);

module.exports = router;
