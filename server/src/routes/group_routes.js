const express = require('express');
const router = express.Router();
const { createGroup } = require('../controllers/group_controller');

router.post('/groups', createGroup);

module.exports = router;
