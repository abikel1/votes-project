// server/src/routes/group_routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth_middleware');

const {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getAllGroups,
  requestJoinGroup,
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getGroupMembers,
  getUserGroups,
  getMyJoinStatuses,
  getMyMembership,
  removeMember,
  getCandidateRequests,
  generateGroupDescription,
  getAppliedGroupsController,
} = require('../controllers/group_controller');

const {
  getGroupChat,
  sendChatMessage,
  deleteChatMessage,
  updateChatMessage,
  getGroupChatSummary,
} = require('../controllers/chat_controller');

const handleGroupDependencies = require('../middlewares/group_middleware');
const Group = require('../models/group_model');

// ✅ חייב להיות ממש למעלה, לפני כל "/:id" למיניהם
router.post('/ai-description', auth, generateGroupDescription);

// ---------- CRUD בסיסי לקבוצות ----------
router.post('/create', auth, createGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, handleGroupDependencies, deleteGroup);

// ✅ בקשות הצטרפות כחבר בקבוצה
router.get('/:id/join-requests', auth, listJoinRequests);

// ✅ בקשות מועמדות (מועמדים להצבעה בקבוצה)
router.get('/:id/candidate-requests', auth, getCandidateRequests);

router.get('/my', auth, getUserGroups);
router.get('/my-join-status', auth, getMyJoinStatuses);
router.get('/:id/my-membership', auth, getMyMembership);

router.patch('/:id/members/remove', auth, removeMember);
router.get('/applied', auth, getAppliedGroupsController);

// ---------- slug ----------
router.get('/slug/:slug', async (req, res) => {
  try {
    const rawSlug = req.params.slug || '';
    const slug = decodeURIComponent(rawSlug).trim().toLowerCase();

    if (!slug) {
      return res.status(400).json({ message: 'Missing slug' });
    }

    const makeSlugInner = (name = '') =>
      String(name)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    let group = null;

    // אם slug הוא ObjectId חוקי – ננסה לפי id
    if (/^[0-9a-fA-F]{24}$/.test(slug)) {
      group = await Group.findById(slug);
    }

    // אחרת – משווים לסלאג מהשם
    if (!group) {
      const all = await Group.find().lean();
      group = all.find((g) => makeSlugInner(g.name) === slug) || null;
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

// ---------- צ׳אט – חשוב לפני /:id ----------
router.get('/:id/chat', auth, getGroupChat);
router.get('/:id/chat/summary', auth, getGroupChatSummary);
router.post('/:id/chat', auth, sendChatMessage);
router.patch('/:id/chat/:msgId', auth, updateChatMessage);
router.delete('/:id/chat/:msgId', auth, deleteChatMessage);

// ---------- שאר הראוטים ----------
router.get('/:id/members', getGroupMembers);
router.get('/:id', getGroupById);
router.get('/', getAllGroups);

router.post('/:id/join', auth, requestJoinGroup);

// עדכון סטטוס בקשות הצטרפות (חברות בקבוצה)
router.patch('/:id/join-requests/:reqId/approve', auth, approveJoinRequest);
router.patch('/:id/join-requests/:reqId/reject', auth, rejectJoinRequest);

module.exports = router;
