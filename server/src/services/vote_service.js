const mongoose = require('mongoose');
const Vote = require('../models/vote_model');
const Group = require('../models/group_model');
const Candidate = require('../models/candidate_model');
const User = require('../models/user_model');

/**
 * יצירת הצבעה חדשה
 * @param {{ userId: string, groupId: string, candidateId: string }} voteData
 * @returns {Promise<Object>} מסמך ההצבעה שנוצר
 */
async function createVoteService(voteData) {
  const { userId, groupId, candidateId } = voteData || {};
  const isId = (v) => mongoose.isValidObjectId(v);

  if (!userId || !groupId || !candidateId) {
    throw new Error('Missing required fields (userId, groupId, candidateId)');
  }
  if (!isId(userId) || !isId(groupId) || !isId(candidateId)) {
    throw new Error('Invalid IDs format');
  }

  const [user, group, candidate] = await Promise.all([
    User.findById(userId).lean(),
    Group.findById(groupId).lean(),
    Candidate.findById(candidateId).lean(),
  ]);

  if (!user) throw new Error('User not found');
  if (!group) throw new Error('Group not found');
  if (!candidate) throw new Error('Candidate not found');

  if (group.endDate && new Date(group.endDate).getTime() < Date.now()) {
    throw new Error('Voting period has ended for this group');
  }

  if (!candidate.groupId || String(candidate.groupId) !== String(groupId)) {
    throw new Error('Candidate does not belong to this group');
  }

  const exists = await Vote.findOne({ userId, groupId }).lean();
  if (exists) throw new Error('User already voted in this group');

  const session = await mongoose.startSession();
  try {
    let createdVote = null;

    await session.withTransaction(async () => {
      const voteDoc = new Vote({ userId, groupId, candidateId });
      await voteDoc.save({ session });

      await Candidate.updateOne(
        { _id: candidateId },
        { $inc: { votesCount: 1 } },
        { session }
      );

      createdVote = voteDoc;
    });

    console.log('✅ Vote created:', createdVote);
    return createdVote;
  } catch (e) {
    if (e && e.code === 11000) e.message = 'User already voted in this group';
    throw e;
  } finally {
    session.endSession();
  }
}

async function deleteVoteService(voteData) {
  const { userId, groupId } = voteData || {};
  const isId = (v) => mongoose.isValidObjectId(v);

  if (!userId || !groupId) throw new Error('Missing required fields (userId, groupId)');
  if (!isId(userId) || !isId(groupId)) throw new Error('Invalid IDs format');

  const vote = await Vote.findOne({ userId, groupId }).lean();
  if (!vote) throw new Error('Vote not found');

  const session = await mongoose.startSession();
  try {
    let deleted = null;

    await session.withTransaction(async () => {
      const delRes = await Vote.deleteOne({ _id: vote._id }, { session });
      if (delRes.deletedCount !== 1) throw new Error('Failed to delete vote');

      deleted = vote;

      if (vote.candidateId) {
        await Candidate.updateOne(
          { _id: vote.candidateId },
          { $inc: { votesCount: -1 } },
          { session }
        );
      }
    });

    console.log('🗑️ Vote deleted:', deleted);
    return deleted;
  } finally {
    session.endSession();
  }
}

async function getVotesByCandidateInGroupService({ candidateId, groupId }) {
  const isId = (v) => mongoose.isValidObjectId(v);
  if (!candidateId || !groupId) throw new Error('Missing required fields (candidateId, groupId)');
  if (!isId(candidateId) || !isId(groupId)) throw new Error('Invalid IDs format');

  const [group, candidate] = await Promise.all([
    Group.findById(groupId).lean(),
    Candidate.findById(candidateId).lean(),
  ]);
  if (!group) throw new Error('Group not found');
  if (!candidate) throw new Error('Candidate not found');

  if (!candidate.groupId || String(candidate.groupId) !== String(groupId)) {
    throw new Error('Candidate does not belong to this group');
  }

  const votes = await Vote.find({ candidateId, groupId }).lean();
  return votes;
}

module.exports = { createVoteService, deleteVoteService, getVotesByCandidateInGroupService };
