const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth_middleware');
const {
  createGroup, updateGroup, deleteGroup, getGroupById, getAllGroups,
  requestJoinGroup, listJoinRequests, approveJoinRequest, rejectJoinRequest,
  getGroupMembers, getUserGroups, getMyJoinStatuses, getMyMembership,
  removeMember,
} = require('../controllers/group_controller');
const handleGroupDependencies = require('../middlewares/group_middleware');

const Group = require('../models/group_model');

router.post('/create', auth, createGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, handleGroupDependencies, deleteGroup);

router.get('/my', auth, getUserGroups);
router.get('/my-join-status', auth, getMyJoinStatuses);
router.get('/:id/my-membership', auth, getMyMembership);

router.patch('/:id/members/remove', auth, removeMember);

// קבלת קבוצה לפי slug (שם בקישור) – למשל /api/groups/slug/קק
router.get('/slug/:slug', async (req, res) => {
  try {
    const rawSlug = req.params.slug || '';
    const slug = decodeURIComponent(rawSlug).trim().toLowerCase();

    if (!slug) {
      return res.status(400).json({ message: 'Missing slug' });
    }

    const group = await Group.findOne({
      name: { $regex: new RegExp(`^${slug}$`, 'i') }  // התאמה לפי שם, לא תלוי רישיות
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (err) {
    console.error('get group by slug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', getGroupById);
router.get('/:id/members', getGroupMembers);
router.get('/', getAllGroups);

router.post('/:id/join', auth, requestJoinGroup);
router.get('/:id/requests', auth, listJoinRequests);
router.patch('/:id/requests/:reqId/approve', auth, approveJoinRequest);
router.patch('/:id/requests/:reqId/reject', auth, rejectJoinRequest);

module.exports = router;
