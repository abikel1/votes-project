// server/src/routes/group_routes.js
const express = require('express');
const router = express.Router();

const {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getAllGroups,
} = require('../controllers/group_controller');

// שימי ראוטים "מפורשים" לפני :id כדי שלא יתנגשו
router.post('/create', createGroup);
router.get('/', getAllGroups);        // GET /api/groups
router.get('/:id', getGroupById);     // GET /api/groups/:id
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router;
