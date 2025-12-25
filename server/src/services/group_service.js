const mongoose = require('mongoose');
const Group = require('../models/group_model');
const Candidate = require('../models/candidate_model');
const User = require('../models/user_model');
const Campaign = require('../models/campaign_model');
const ChatMessage = require('../models/chat_message_model');
const Vote = require('../models/vote_model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

function toBoolStrict(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return null;
}

async function createGroupService(data, user) {
  if (!user || !user.email) throw new Error('Missing user.email');

  const parsedIsLocked = toBoolStrict(data.isLocked);
  if (parsedIsLocked === null) {
    const err = new Error('MISSING_IS_LOCKED');
    err.code = 'MISSING_IS_LOCKED';
    throw err;
  }

  if (new Date(data.candidateEndDate) > new Date(data.endDate)) {
    throw new Error('Candidate end date cannot be after group end date');
  }

  const group = await Group.create({
    name: data.name,
    description: data.description,
    createdBy: (user.email || '').trim().toLowerCase(),
    createdById: user._id,
    endDate: data.endDate,
    candidateEndDate: data.candidateEndDate,
    maxWinners: data.maxWinners ?? 1,
    shareLink: data.shareLink || undefined,
    isLocked: parsedIsLocked,
  });

  return group;
}

async function updateGroupService(groupId, updateData) {
  console.log('BODY UPDATE:', updateData);

  if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'isLocked')) {
    const v = toBoolStrict(updateData.isLocked);
    if (v !== null) updateData.isLocked = v;
  }

  if (updateData.candidateEndDate && updateData.endDate) {
    if (new Date(updateData.candidateEndDate) > new Date(updateData.endDate)) {
      throw new Error('Candidate end date cannot be after group end date');
    }
  }

  return Group.findByIdAndUpdate(groupId, updateData, {
    new: true,
    runValidators: true,
  });
}

async function deleteGroupService(groupId) {
  const candidates = await Candidate.find({ groupId }).select('_id');
  const candidateIds = candidates.map(c => c._id);

  if (candidateIds.length > 0) {
    await Campaign.deleteMany({ candidate: { $in: candidateIds } });
  }
  await Candidate.deleteMany({ groupId });
  await ChatMessage.deleteMany({ groupId });
  await Vote.deleteMany({ groupId });
  return Group.findByIdAndDelete(groupId);
}

async function getGroupByIdService(groupId) {
  return Group.findById(groupId)
    .populate('candidates')
    .populate({ path: 'members', select: 'name email' });
}

async function getAllGroupsService() {
  return Group.find()
    .lean()
    .populate({ path: 'candidates', select: 'name photoUrl' })
    .populate({ path: 'createdById', select: 'firstName lastName' });

}

async function requestJoinGroupService(groupId, user) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (!g.isLocked) throw new Error('Group is not locked');
  if (g.members?.some((id) => String(id) === String(user._id))) return g;
  const emailNorm = (user.email || '').trim().toLowerCase();
  if (Array.isArray(g.participants) && g.participants.includes(emailNorm)) return g;
  const exists = g.joinRequests?.find(
    (r) => String(r.userId) === String(user._id) && r.status === 'pending'
  );
  if (exists) return g;

  g.joinRequests.push({
    userId: user._id,
    email: emailNorm,
    name: user.name || user.fullName || '',
    status: 'pending',
  });

  await g.save();
  return g;
}

async function listJoinRequestsService(groupId, ownerId) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') {
    throw new Error('Not owner');
  }
  return (g.joinRequests || []).filter((r) => r.status === 'pending');
}

async function setJoinRequestStatusService(groupId, ownerId, reqId, status) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') {
    throw new Error('Not owner');
  }

  const req = g.joinRequests.id(reqId);
  if (!req) throw new Error('Request not found');

  if (status === 'approved') {
    if (!g.members) g.members = [];
    if (!g.members.some((id) => String(id) === String(req.userId))) {
      g.members.push(req.userId);
    }
    if (!Array.isArray(g.participants)) g.participants = [];
    const emailNorm = (req.email || '').trim().toLowerCase();
    if (
      emailNorm &&
      !g.participants.map((e) => (e || '').trim().toLowerCase()).includes(emailNorm)
    ) {
      g.participants.push(emailNorm);
    }
    req.deleteOne();
  } else if (status === 'rejected') {
    req.deleteOne();
  } else {
    req.status = status;
  }

  await g.save();
  return g;
}

async function getUserGroupsService(user) {
  if (!user || !user.email) throw new Error('User email is required');
  const email = (user.email || '').trim().toLowerCase();
  const userId = user._id;

  const created = await Group.find({ createdBy: email }).lean();
  const joinedByMembers = await Group.find({ members: userId }).lean();
  const joinedByParticipants = await Group.find({ participants: email }).lean();

  const uniq = new Map();
  for (const g of [...joinedByMembers, ...joinedByParticipants]) {
    uniq.set(String(g._id), g);
  }
  const joined = Array.from(uniq.values());

  return { created, joined };
}

async function getMyJoinStatusesService(user) {
  if (!user) throw new Error('User required');

  const orConds = [];
  if (user._id && mongoose.isValidObjectId(user._id)) {
    orConds.push({
      joinRequests: {
        $elemMatch: {
          userId: new mongoose.Types.ObjectId(user._id),
          status: 'pending',
        },
      },
    });
  }
  if (user.email) {
    orConds.push({
      joinRequests: {
        $elemMatch: {
          email: (user.email || '').trim().toLowerCase(),
          status: 'pending',
        },
      },
    });
  }

  if (!orConds.length) return { pending: [] };

  const rows = await Group.find({ $or: orConds }, { _id: 1 }).lean();
  return { pending: rows.map((r) => String(r._id)) };
}

async function isMemberOfGroupService(groupId, user) {
  if (!user) throw new Error('User required');
  const g = await Group.findById(groupId).lean();
  if (!g) throw new Error('Group not found');

  const uid = String(user._id || '');
  const email = (user.email || '').trim().toLowerCase();

  const byMembers =
    Array.isArray(g.members) && g.members.some((id) => String(id) === uid);
  const byParticipants =
    Array.isArray(g.participants) &&
    g.participants.map((e) => (e || '').trim().toLowerCase()).includes(email);

  return { member: !!(byMembers || byParticipants) };
}

async function removeGroupMemberService(groupId, ownerId, { memberId, email }) {
  if (!memberId && !email) {
    const e = new Error('memberId or email is required');
    e.code = 'BAD_ARGS';
    throw e;
  }

  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') {
    throw new Error('Not owner');
  }

  const emailNorm = (email || '').trim().toLowerCase();
  if (memberId) {
    g.members = (g.members || []).filter((id) => String(id) !== String(memberId));
  }

  if (emailNorm) {
    g.participants = (g.participants || [])
      .map((e) => (e || '').trim().toLowerCase())
      .filter((e) => e !== emailNorm);
  }

  g.joinRequests = (g.joinRequests || []).filter((r) => {
    const sameUser = memberId && String(r.userId) === String(memberId);
    const sameEmail =
      emailNorm && (r.email || '').trim().toLowerCase() === emailNorm;
    return !(sameUser || sameEmail);
  });

  await g.save();

  const updated = await Group.findById(groupId).populate({
    path: 'members',
    select: 'name email',
  });

  return updated;
}

async function applyCandidateService(groupId, user, data) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');

  const now = new Date();
  if (g.candidateEndDate && now > g.candidateEndDate) {
    const e = new Error('Candidate submission period has ended');
    e.code = 'CANDIDATE_PERIOD_ENDED';
    throw e;
  }

  const alreadyCandidate = await Candidate.findOne({
    groupId,
    userId: user._id,
  }).lean();

  if (alreadyCandidate) {
    const e = new Error('Already a candidate');
    e.code = 'ALREADY_CANDIDATE';
    throw e;
  }

  let req =
    (g.candidateRequests || []).find(
      (r) => String(r.userId) === String(user._id)
    ) || null;

  if (req) {
    req.name = data.name || user.name || '';
    req.description = data.description || '';
    req.symbol = data.symbol || '';
    req.photoUrl = data.photoUrl || '';
    req.email = (user.email || '').trim().toLowerCase();
    req.status = 'pending';
  } else {
    const newReq = {
      userId: user._id,
      email: (user.email || '').trim().toLowerCase(),
      name: data.name || user.name || '',
      description: data.description || '',
      symbol: data.symbol || '',
      photoUrl: data.photoUrl || '',
      status: 'pending',
      createdAt: new Date(),
    };
    g.candidateRequests.push(newReq);
    req = g.candidateRequests[g.candidateRequests.length - 1];
  }

  await g.save();

  return {
    groupId: String(g._id),
    request: req,
  };
}

async function approveCandidateRequestService(groupId, ownerId, requestId) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') {
    throw new Error('Not owner');
  }

  const req = g.candidateRequests.id(requestId);
  if (!req) throw new Error('Request not found');

  if (req.status === 'approved') {
    throw new Error('Request already approved');
  }

  req.status = 'approved';

  const candidate = await Candidate.create({
    userId: req.userId,
    groupId,
    name: req.name,
    description: req.description,
    symbol: req.symbol || '',
    photoUrl: req.photoUrl || '',
  });

  await g.save();

  return {
    groupId: String(g._id),
    request: req,
    candidate,
  };
}

async function rejectCandidateRequestService(groupId, adminId, requestId) {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');

  if (String(group.createdById) !== String(adminId) && adminId !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  const request = group.candidateRequests.id(requestId);
  if (!request) throw new Error('Request not found');

  request.status = 'rejected';
  await group.save();

  return {
    groupId: String(group._id),
    request,
  };
}

async function addCandidateByEmailService(groupId, ownerId, email, data = {}) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') {
    throw new Error('Not owner');
  }

  const norm = email.trim().toLowerCase();
  const user = await User.findOne({ email: norm });
  if (!user) throw new Error('User not found');

  const exists = await Candidate.findOne({ groupId, userId: user._id });
  if (exists) throw new Error('Candidate already exists');

  const candidate = await Candidate.create({
    userId: user._id,
    name: data.name || user.name,
    description: data.description || '',
    photoUrl: data.photoUrl || '',
    symbol: data.symbol || '',
    groupId,
  });

  return candidate;
}

async function getCandidateRequestsService(groupId) {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');
  return group.candidateRequests || [];
}

async function getAppliedGroupsService(user) {
  if (!user || !user._id) throw new Error('User required');

  const groups = await Group.find({
    candidateRequests: {
      $elemMatch: {
        userId: user._id,
        status: { $in: ['approved'] },
      },
    },
  })
    .lean()
    .populate({ path: 'createdById', select: 'firstName lastName' });

  return groups;
}

async function generateGroupDescriptionService(name, hint = '') {

  if (!genAI || !process.env.GEMINI_API_KEY) {
    return 'קבוצה חדשה באתר ההצבעות. תיאור יתווסף בהמשך.';
  }

  const safeName = String(name || '').trim();
  const safeHint = String(hint || '').trim();

  const hasHebrew = /[\u0590-\u05FF]/.test(safeName);
  const hasEnglish = /[A-Za-z]/.test(safeName);

  let defaultLang = 'he';
  if (hasEnglish && !hasHebrew) {
    defaultLang = 'en';
  }
  if (!genAI || !process.env.GEMINI_API_KEY) {
    if (defaultLang === 'en') {
      return 'A new voting group on the site. A description will be added later.';
    }
    return 'קבוצה חדשה באתר ההצבעות. תיאור יתווסף בהמשך.';
  }

  const prompt = `
You are helping to create a short description for a voting group.

Group name: "${safeName || 'Unnamed group'}"

Creator instructions (optional):
"${safeHint || 'None'}"

Language rule:
- Write the description in the **same main language** as the group name.
- If the group name is mostly Hebrew, write in Hebrew.
- If it is mostly English, write in English.
- If it is in another language, write in that language.

Guidelines:
1. Length: 2–4 short sentences.
2. Tone: clear, inviting, and suitable for a voting group page (no heavy slang).
3. Do not use emojis, stars, headings, or bullet lists – plain text only.
4. Do not add details that are not implied by the name or the instructions.
`.trim();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = (response.text() || '').trim();

  if (!text) {
    if (defaultLang === 'en') {
      return 'A new voting group on the site.';
    }
    return 'קבוצה חדשה באתר ההצבעות.';
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (!lines.length) {
    if (defaultLang === 'en') {
      return 'A new voting group on the site.';
    }
    return 'קבוצה חדשה באתר ההצבעות.';
  }

  return lines.join('\n');
}

module.exports = {
  createGroupService,
  updateGroupService,
  deleteGroupService,
  getGroupByIdService,
  getAllGroupsService,
  requestJoinGroupService,
  listJoinRequestsService,
  setJoinRequestStatusService,
  getUserGroupsService,
  getMyJoinStatusesService,
  isMemberOfGroupService,
  removeGroupMemberService,
  applyCandidateService,
  approveCandidateRequestService,
  addCandidateByEmailService,
  rejectCandidateRequestService,
  getCandidateRequestsService,
  generateGroupDescriptionService,
  getAppliedGroupsService
};
