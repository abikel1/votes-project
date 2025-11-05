const { createVoteService } = require('../services/vote_service');

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

module.exports = { createVote };
