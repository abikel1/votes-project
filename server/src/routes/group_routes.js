const express = require('express');
const router = express.Router();
const {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getAllGroups
} = require('../controllers/group_controller');

router.post('/create', createGroup);
router.put('/:id', updateGroup);        // עריכה
router.delete('/:id', deleteGroup);     // מחיקה
router.get('/:id', getGroupById);       // קבלת קבוצה לפי ID
router.get('/', getAllGroups);          // קבלת כל הקבוצות

module.exports = router;
