const {
  createVoteService,
  deleteVoteService,
  getVotesByCandidateInGroupService,
  getVotersByGroupService,
  hasUserVotedInGroup,
} = require('../services/vote_service');

async function createVote(req, res) {
  try {
    const voteData = req.body; // { userId, groupId, candidateId }
    const vote = await createVoteService(voteData);
    return res.status(201).json(vote);
  } catch (err) {
    const msg = String(err.message || '');
    if (msg.includes('Missing required fields') || msg.includes('Invalid IDs'))
      return res.status(400).json({ message: msg });
    if (msg.includes('not found'))
      return res.status(404).json({ message: msg });
    if (msg.includes('Voting period has ended') || msg.includes('does not belong'))
      return res.status(400).json({ message: msg });
    if (msg.includes('already voted'))
      return res.status(409).json({ message: 'User already voted in this group' });
    return res.status(500).json({ message: 'Error creating vote' });
  }
}

async function deleteVote(req, res) {
  try {
    const { userId, groupId } = req.body;
    const deleted = await deleteVoteService({ userId, groupId });
    return res.status(200).json(deleted);
  } catch (err) {
    const msg = String(err.message || '');
    if (msg.includes('Missing required fields') || msg.includes('Invalid IDs'))
      return res.status(400).json({ message: msg });
    if (msg.includes('Vote not found'))
      return res.status(404).json({ message: msg });
    return res.status(500).json({ message: 'Error deleting vote' });
  }
}

async function getVotesByCandidateInGroup(req, res) {
  try {
    const { candidateId, groupId } = req.query;
    const votes = await getVotesByCandidateInGroupService({ candidateId, groupId });
    return res.status(200).json(votes);
  } catch (err) {
    const msg = String(err.message || '');
    if (msg.includes('Missing required fields') || msg.includes('Invalid IDs'))
      return res.status(400).json({ message: msg });
    if (msg.includes('not found'))
      return res.status(404).json({ message: msg });
    if (msg.includes('does not belong'))
      return res.status(400).json({ message: msg });
    return res.status(500).json({ message: 'Error getting votes by candidate in group' });
  }
}

/** חדש: מחזיר את כל המצביעים בקבוצה */
async function getVotersByGroup(req, res) {
  try {
    const { groupId } = req.params;
    const voters = await getVotersByGroupService({ groupId });
    return res.status(200).json(voters);
  } catch (err) {
    const msg = String(err.message || '');
    if (msg.includes('Missing required fields') || msg.includes('Invalid IDs'))
      return res.status(400).json({ message: msg });
    if (msg.includes('Group not found'))
      return res.status(404).json({ message: msg });
    return res.status(500).json({ message: 'Error getting voters' });
  }
}

/** חדש: האם משתמש כבר הצביע בקבוצה */
async function hasVoted(req, res) {
  try {
    const { userId, groupId } = req.query;
    const voted = await hasUserVotedInGroup(userId, groupId);
    return res.status(200).json({ voted: !!voted });
  } catch {
    return res.status(200).json({ voted: false });
  }
}

module.exports = {
  createVote,
  deleteVote,
  getVotesByCandidateInGroup,
  getVotersByGroup,
  hasVoted,
};
