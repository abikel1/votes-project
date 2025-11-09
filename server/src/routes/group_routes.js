const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth_middleware');
const {
  createGroup, updateGroup, deleteGroup, getGroupById, getAllGroups,
  requestJoinGroup, listJoinRequests, approveJoinRequest, rejectJoinRequest,
  getGroupMembers, // ✅
} = require('../controllers/group_controller');

router.post('/create', auth, createGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, deleteGroup);

router.get('/:id', getGroupById);
router.get('/:id/members', getGroupMembers); // ✅ חדש
router.get('/', getAllGroups);

router.post('/:id/join', auth, requestJoinGroup);
router.get('/:id/requests', auth, listJoinRequests);
router.patch('/:id/requests/:reqId/approve', auth, approveJoinRequest);
router.patch('/:id/requests/:reqId/reject', auth, rejectJoinRequest);

module.exports = router;
