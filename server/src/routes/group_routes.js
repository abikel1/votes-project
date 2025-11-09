const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth_middleware');
const {
  createGroup, updateGroup, deleteGroup, getGroupById, getAllGroups,
  requestJoinGroup, listJoinRequests, approveJoinRequest, rejectJoinRequest,
  getGroupMembers,getUserGroups, // ✅
} = require('../controllers/group_controller');
const handleGroupDependencies = require('../middlewares/group_middleware'); // אם יש לך, השאירי

router.post('/create', auth, createGroup);
router.put('/:id', auth, updateGroup);
// <<<<<<< HEAD
// router.delete('/:id', auth, deleteGroup);
// =======
router.delete('/:id', auth, handleGroupDependencies, deleteGroup);
router.get('/my', auth, getUserGroups);
// >>>>>>> a1c83c8d2145ebf88aa769ba8d04af15a79010c3

router.get('/:id', getGroupById);
router.get('/:id/members', getGroupMembers); // ✅ חדש
router.get('/', getAllGroups);

router.post('/:id/join', auth, requestJoinGroup);
router.get('/:id/requests', auth, listJoinRequests);
router.patch('/:id/requests/:reqId/approve', auth, approveJoinRequest);
router.patch('/:id/requests/:reqId/reject', auth, rejectJoinRequest);

module.exports = router;
