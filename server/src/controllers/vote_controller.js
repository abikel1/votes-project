// server/src/controllers/vote_controller.js
const { createVoteService, deleteVoteService , getVotesByCandidateInGroupService } = require('../services/vote_service');

async function createVote(req, res) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id; // לפי המבנה של ה-JWT אצלך
    const { groupId, candidateId } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const vote = await createVoteService({ userId, groupId, candidateId });
    return res.status(201).json({ ok: true, voteId: vote._id, groupId, candidateId });
  } catch (err) {
    console.error('❌ Error creating vote:', err);
    // שגיאת הצבעה כפולה/ולידציה – נחזיר 400 במקום 500
    if (err?.code === 11000 || /already voted/i.test(err?.message)) {
      return res.status(400).json({ message: 'User already voted in this group' });
    }
    return res.status(400).json({ message: err?.message || 'Error creating vote' });
  }
}

async function deleteVote(req, res) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    const { groupId } = req.body;
    const deleted = await deleteVoteService({ userId, groupId });
    res.status(200).json(deleted);
  } catch (err) {
    console.error('❌ Error deleting vote:', err);
    res.status(400).json({ message: err?.message || 'Error deleting vote' });
  }
}

async function getVotesByCandidateInGroup(req, res) {
  try {
    const { candidateId, groupId } = req.query;
    const votes = await getVotesByCandidateInGroupService({ candidateId, groupId });
    res.status(200).json(votes);
  } catch (err) {
    console.error('❌ Error getting votes by candidate in group:', err);
    res.status(400).json({ message: err?.message || 'Error getting votes by candidate in group' });
  }
}

module.exports = { createVote, deleteVote, getVotesByCandidateInGroup };
