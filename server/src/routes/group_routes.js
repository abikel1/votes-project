const express = require('express');
const router = express.Router();
const {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getAllGroups
} = require('../controllers/group_controller');

const handleGroupDependencies = require('../middlewares/group_middleware');

router.post('/create', createGroup);
router.put('/:id', updateGroup);

// ✅ המחיקה עוברת קודם דרך ה-middleware של התלויות
router.delete('/:id', handleGroupDependencies, deleteGroup);

router.get('/:id', getGroupById);
router.get('/', getAllGroups);

module.exports = router;
