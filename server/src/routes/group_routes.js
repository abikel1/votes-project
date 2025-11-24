// server/src/routes/group_routes.js
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth_middleware');
const {
  createGroup, updateGroup, deleteGroup, getGroupById, getAllGroups,
  requestJoinGroup, listJoinRequests, approveJoinRequest, rejectJoinRequest,
  getGroupMembers, getUserGroups, getMyJoinStatuses, getMyMembership,
  removeMember,getCandidateRequests,
} = require('../controllers/group_controller');

const {
  getGroupChat,
  sendChatMessage,
  deleteChatMessage,
  updateChatMessage,   // ✅ חדש – עריכת הודעת צ׳אט
} = require('../controllers/chat_controller');

const handleGroupDependencies = require('../middlewares/group_middleware');

const Group = require('../models/group_model');

router.post('/create', auth, createGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, handleGroupDependencies, deleteGroup);
router.get('/:groupId/requests', auth, getCandidateRequests);

router.get('/my', auth, getUserGroups);
router.get('/my-join-status', auth, getMyJoinStatuses);
router.get('/:id/my-membership', auth, getMyMembership);

router.patch('/:id/members/remove', auth, removeMember);

function makeSlug(name = '') {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

// קבלת קבוצה לפי slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const rawSlug = req.params.slug || '';
    const slug = decodeURIComponent(rawSlug).trim().toLowerCase();

    if (!slug) {
      return res.status(400).json({ message: 'Missing slug' });
    }

    const makeSlug = (name = '') =>
      String(name)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    let group = null;

    if (/^[0-9a-fA-F]{24}$/.test(slug)) {
      group = await Group.findById(slug);
    }

    if (!group) {
      const all = await Group.find().lean();
      group = all.find((g) => makeSlug(g.name) === slug) || null;
    }

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

// צ'אט קבוצה
router.get('/:id/chat', auth, getGroupChat);
router.post('/:id/chat', auth, sendChatMessage);
router.patch('/:id/chat/:msgId', auth, updateChatMessage);  // עריכת הודעה
router.delete('/:id/chat/:msgId', auth, deleteChatMessage);

module.exports = router;
