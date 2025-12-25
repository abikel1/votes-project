const mongoose = require('mongoose');
const Vote = require('../models/vote_model');
const Group = require('../models/group_model');
const Candidate = require('../models/candidate_model');
const User = require('../models/user_model');

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

async function hasUserVotedInGroup(userId, groupId) {
  const exists = await Vote.exists({ userId, groupId });
  return Boolean(exists);
}

async function getVotersByGroupService({ groupId }) {
  const isId = (v) => mongoose.isValidObjectId(v);
  if (!groupId) throw new Error('Missing required fields (groupId)');
  if (!isId(groupId)) throw new Error('Invalid IDs format');

  const group = await Group.findById(groupId).lean();
  if (!group) throw new Error('Group not found');

  const votes = await Vote.find({ groupId }).sort({ updatedAt: -1 }).lean();
  const userIds = [...new Set(votes.map(v => String(v.userId)))];

  const users = await User.find({ _id: { $in: userIds } })
    .select([
      '_id',
      'email',
      'name',
      'fullName',
      'displayName',
      'username',
      'firstName',
      'lastName',
      'first_name',
      'last_name',
      'givenName',
      'familyName',
      'profile.firstName',
      'profile.lastName',
      'metadata.firstName',
      'metadata.lastName',
      'phone',
      'phoneNumber',
      'mobile',
    ].join(' '))
    .lean();

  const userById = new Map(users.map(u => [String(u._id), u]));
  const pick = (...vals) => vals.find(v => typeof v === 'string' && v.trim())?.trim();

  const firstOf = (u = {}) =>
    pick(u.firstName, u.first_name, u.givenName, u.profile?.firstName, u.metadata?.firstName);

  const lastOf = (u = {}) =>
    pick(u.lastName, u.last_name, u.familyName, u.profile?.lastName, u.metadata?.lastName);

  const displayNameOf = (u = {}) => {
    const fn = firstOf(u);
    const ln = lastOf(u);
    const joined = [fn, ln].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    const fromEmail = (u.email || '').split('@')[0] || null;
    return (
      joined ||
      u.name ||
      u.fullName ||
      u.displayName ||
      u.username ||
      fromEmail ||
      null
    );
  };

  return votes.map(v => {
    const u = userById.get(String(v.userId)) || {};
    return {
      _id: v._id,
      userId: v.userId,
      firstName: firstOf(u) || null,
      lastName: lastOf(u) || null,
      name: displayNameOf(u),
      email: u.email || null,
      phone: u.phone || u.phoneNumber || u.mobile || null,
      lastVoteAt: v.updatedAt || v.timestamp || v.createdAt,
    };
  });
}
async function getMyFinishedVotedGroupsWithWinners(userId) {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new Error('Invalid userId');
  }

  const now = new Date();

  const votes = await Vote.find({ userId })
    .populate({
      path: 'groupId',
      model: Group,
      select: ['name', 'endDate', 'maxWinners']
    })
    .lean();

  if (!votes.length) return [];

  const finishedGroupIds = [
    ...new Set(
      votes
        .filter(v => v.groupId && v.groupId.endDate && new Date(v.groupId.endDate) < now)
        .map(v => String(v.groupId._id))
    )
  ];

  if (!finishedGroupIds.length) return [];

  const groups = await Group.find({ _id: { $in: finishedGroupIds } })
    .select(['name', 'endDate', 'maxWinners'])
    .lean();
  const groupsById = new Map(groups.map(g => [String(g._id), g]));

  const candidates = await Candidate.find({ groupId: { $in: finishedGroupIds } })
    .select(['name', 'description', 'votesCount', 'userId', 'photoUrl', 'symbol', 'groupId'])
    .lean();

  const candidatesByGroup = new Map();
  for (const c of candidates) {
    const gid = String(c.groupId);
    if (!candidatesByGroup.has(gid)) candidatesByGroup.set(gid, []);
    candidatesByGroup.get(gid).push(c);
  }

  const result = [];

  for (const gid of finishedGroupIds) {
    const g = groupsById.get(gid);
    if (!g) continue;

    const list = candidatesByGroup.get(gid) || [];
    if (!list.length) {
      result.push({
        groupId: gid,
        groupName: g.name,
        endDate: g.endDate,
        winners: []
      });
      continue;
    }

    const sorted = [...list].sort(
      (a, b) => (b.votesCount || 0) - (a.votesCount || 0)
    );

    const maxWinners = g.maxWinners || 1;
    const top = sorted.slice(0, maxWinners);

    let winners = top;
    if (sorted.length > maxWinners) {
      const lastVotes = top[top.length - 1].votesCount || 0;
      winners = sorted.filter(c => (c.votesCount || 0) >= lastVotes);
    }

    result.push({
      groupId: gid,
      groupName: g.name,
      endDate: g.endDate,
      winners: winners.map((c) => ({
        _id: c._id,
        name: c.name,
        description: c.description,
        votesCount: c.votesCount || 0,
        userId: c.userId,
        photoUrl: c.photoUrl,
        symbol: c.symbol,
      }))
    });
  }

  return result;
}

module.exports = {
  createVoteService,
  deleteVoteService,
  getVotesByCandidateInGroupService,
  getVotersByGroupService,
  hasUserVotedInGroup,
  getMyFinishedVotedGroupsWithWinners,
};

