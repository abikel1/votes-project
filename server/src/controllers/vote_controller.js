const { createVoteService, deleteVoteService  } = require('../services/vote_service');

async function createVote(req, res) {
  try {
    // לפי הסגנון של group: הכל נכנס מ-body (אפשר בעתיד לעבור ל-auth)
    const voteData = req.body;
    const vote = await createVoteService(voteData);
    res.status(201).json(vote);
  } catch (err) {
    console.error('❌ Error creating vote:', err);
    res.status(500).json({ message: 'Error creating vote' });
  }
}

async function deleteVote(req, res) {
  try {
    // לפי הסטייל אצלכן: מזהים לפי userId + groupId שנשלחים ב-body
    const { userId, groupId } = req.body;
    const deleted = await deleteVoteService({ userId, groupId });
    res.status(200).json(deleted); // מחזירים את הדוק שנמחק (כמו style פשוט)
  } catch (err) {
    console.error('❌ Error deleting vote:', err);
    res.status(500).json({ message: 'Error deleting vote' });
  }
}

module.exports = { createVote, deleteVote };
