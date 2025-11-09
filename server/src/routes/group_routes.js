const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth_middleware');
const handleGroupDependencies = require('../middlewares/group_middleware'); // אם יש לך, השאירי

const {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getAllGroups,
  getUserGroups,
} = require('../controllers/group_controller');

// יצירה/עדכון/מחיקה – דורשים התחברות כדי שיהיה req.user.email
router.post('/create',
  auth,
  (req, res, next) => {
    console.log('[ROUTE] POST /api/groups/create req.user =', req.user); // ← LOG
    next();
  },
  createGroup
);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, handleGroupDependencies, deleteGroup);
router.get('/my', auth, getUserGroups);

// קריאה
router.get('/:id', getGroupById);
router.get('/', getAllGroups);

module.exports = router;
