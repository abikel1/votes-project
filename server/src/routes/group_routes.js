const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth_middleware');
const {
  createGroup, updateGroup, deleteGroup, getGroupById, getAllGroups,
  requestJoinGroup, listJoinRequests, approveJoinRequest, rejectJoinRequest,
  getGroupMembers, getUserGroups, getMyJoinStatuses, getMyMembership,
  removeMember, // ✅
} = require('../controllers/group_controller');
const handleGroupDependencies = require('../middlewares/group_middleware');

router.post('/create', auth, createGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, handleGroupDependencies, deleteGroup);

router.get('/my', auth, getUserGroups);
router.get('/my-join-status', auth, getMyJoinStatuses);

// בדיקת חברות לקבוצה בודדת
router.get('/:id/my-membership', auth, getMyMembership);

// *** חדש: הסרת משתתף/ת ע״י מנהל/ת ***
// משתמשים ב-PATCH עם גוף { memberId, email }
router.patch('/:id/members/remove', auth, removeMember);

router.get('/:id', getGroupById);
router.get('/:id/members', getGroupMembers);
router.get('/', getAllGroups);

router.post('/:id/join', auth, requestJoinGroup);
router.get('/:id/requests', auth, listJoinRequests);
router.patch('/:id/requests/:reqId/approve', auth, approveJoinRequest);
router.patch('/:id/requests/:reqId/reject', auth, rejectJoinRequest);

module.exports = router;
