// server/src/services/group_service.js
const mongoose = require('mongoose');
const Group = require('../models/group_model');
const Candidate = require('../models/candidate_model');
const User = require('../models/user_model');
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

  // בדיקה: תאריך סיום הגשת מועמדות לא יכול להיות אחרי תאריך הסיום של הקבוצה
  if (new Date(data.candidateEndDate) > new Date(data.endDate)) {
    throw new Error('Candidate end date cannot be after group end date');
  }

  const group = await Group.create({
    name: data.name,
    description: data.description,
    createdBy: (user.email || '').trim().toLowerCase(),
    createdById: user._id,
    endDate: data.endDate,
    candidateEndDate: data.candidateEndDate, // <-- חדש
    maxWinners: data.maxWinners ?? 1,
    shareLink: data.shareLink || undefined,
    isLocked: parsedIsLocked,
  });

  return group;
}


async function updateGroupService(groupId, updateData) {
  console.log("BODY UPDATE:", updateData);

  if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'isLocked')) {
    const v = toBoolStrict(updateData.isLocked);
    if (v !== null) updateData.isLocked = v;
  }

  // אם מגיע candidateEndDate לבדוק שזה לפני endDate
  if (updateData.candidateEndDate && updateData.endDate) {
    if (new Date(updateData.candidateEndDate) > new Date(updateData.endDate)) {
      throw new Error('Candidate end date cannot be after group end date');
    }
  }

  return Group.findByIdAndUpdate(groupId, updateData, { new: true, runValidators: true });
}


async function deleteGroupService(groupId) {
  return Group.findByIdAndDelete(groupId);
}

async function getGroupByIdService(groupId) {
  return Group.findById(groupId)
    .populate('candidates')
    .populate({ path: 'members', select: 'name email' });
}

async function getAllGroupsService() {
  return Group.find()
    .populate('candidates')
    .populate({
      path: 'createdById',
      select: 'firstName lastName email'
    });
}

/* ===== בקשות הצטרפות ===== */

async function requestJoinGroupService(groupId, user) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (!g.isLocked) throw new Error('Group is not locked');

  // כבר חבר?
  if (g.members?.some(id => String(id) === String(user._id))) return g;
  const emailNorm = (user.email || '').trim().toLowerCase();
  if (Array.isArray(g.participants) && g.participants.includes(emailNorm)) return g;

  // קיימת בקשה ממתינה?
  const exists = g.joinRequests?.find(r =>
    String(r.userId) === String(user._id) && r.status === 'pending'
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
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') throw new Error('Not owner');
  return (g.joinRequests || []).filter(r => r.status === 'pending');
}

async function setJoinRequestStatusService(groupId, ownerId, reqId, status) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') throw new Error('Not owner');

  const req = g.joinRequests.id(reqId);
  if (!req) throw new Error('Request not found');

  if (status === 'approved') {
    if (!g.members) g.members = [];
    if (!g.members.some(id => String(id) === String(req.userId))) {
      g.members.push(req.userId);
    }
    if (!Array.isArray(g.participants)) g.participants = [];
    const emailNorm = (req.email || '').trim().toLowerCase();
    if (emailNorm && !g.participants.map(e => (e || '').trim().toLowerCase()).includes(emailNorm)) {
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

/** אילו קבוצות המשתמש יצר ואילו הוא חבר בהן */
async function getUserGroupsService(user) {
  if (!user || !user.email) throw new Error('User email is required');
  const email = (user.email || '').trim().toLowerCase();
  const userId = user._id;

  const created = await Group.find({ createdBy: email }).lean();
  const joinedByMembers = await Group.find({ members: userId }).lean();
  const joinedByParticipants = await Group.find({ participants: email }).lean();

  const uniq = new Map();
  for (const g of [...joinedByMembers, ...joinedByParticipants]) uniq.set(String(g._id), g);
  const joined = Array.from(uniq.values());

  return { created, joined };
}

/** סטטוסים ממתינים שלי: { pending: [groupId,..] } */
async function getMyJoinStatusesService(user) {
  if (!user) throw new Error('User required');

  const orConds = [];
  if (user._id && mongoose.isValidObjectId(user._id)) {
    orConds.push({ joinRequests: { $elemMatch: { userId: new mongoose.Types.ObjectId(user._id), status: 'pending' } } });
  }
  if (user.email) {
    orConds.push({ joinRequests: { $elemMatch: { email: (user.email || '').trim().toLowerCase(), status: 'pending' } } });
  }

  if (!orConds.length) return { pending: [] };

  const rows = await Group.find({ $or: orConds }, { _id: 1 }).lean();
  return { pending: rows.map(r => String(r._id)) };
}

/** חברות בקבוצה מסוימת */
async function isMemberOfGroupService(groupId, user) {
  if (!user) throw new Error('User required');
  const g = await Group.findById(groupId).lean();
  if (!g) throw new Error('Group not found');

  const uid = String(user._id || '');
  const email = (user.email || '').trim().toLowerCase();

  const byMembers = Array.isArray(g.members) && g.members.some(id => String(id) === uid);
  const byParticipants = Array.isArray(g.participants) &&
    g.participants.map(e => (e || '').trim().toLowerCase()).includes(email);

  return { member: !!(byMembers || byParticipants) };
}

/** ✅ הסרת משתתף/ת מהקבוצה ע"י מנהל/ת */
async function removeGroupMemberService(groupId, ownerId, { memberId, email }) {
  if (!memberId && !email) {
    const e = new Error('memberId or email is required');
    e.code = 'BAD_ARGS';
    throw e;
  }

  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') throw new Error('Not owner');

  const emailNorm = (email || '').trim().toLowerCase();

  // הסרה מ-members לפי ObjectId
  if (memberId) {
    g.members = (g.members || []).filter(id => String(id) !== String(memberId));
  }

  // הסרה גם מ-participants לפי אימייל
  if (emailNorm) {
    g.participants = (g.participants || [])
      .map(e => (e || '').trim().toLowerCase())
      .filter(e => e !== emailNorm);
  }

  // מחיקת בקשות בהמתנה של אותו משתמש/אימייל (לא חובה אבל נחמד)
  g.joinRequests = (g.joinRequests || []).filter(r => {
    const sameUser = memberId && String(r.userId) === String(memberId);
    const sameEmail = emailNorm && (r.email || '').trim().toLowerCase() === emailNorm;
    return !(sameUser || sameEmail);
  });

  await g.save();

  const updated = await Group.findById(groupId)
    .populate({ path: 'members', select: 'name email' });

  return updated;
}


//=============================================================================
// async function applyCandidateService(groupId, user, data) {
//   const g = await Group.findById(groupId);
//   if (!g) throw new Error('Group not found');

//     const now = new Date();
//   if (g.candidateEndDate && now > g.candidateEndDate) {
//     throw new Error('Candidate submission period has ended');
//   }

//   // האם כבר חבר?
//   const alreadyCandidate = await Candidate.findOne({
//     groupId,
//     userId: user._id
//   }).lean();
//   if (alreadyCandidate) throw new Error('Already a candidate');

//   // האם כבר הגיש בקשה?
//   const exists = g.candidateRequests?.find(r =>
//     String(r.userId) === String(user._id) && r.status === 'pending'
//   );
//   if (exists) return g;

//   g.candidateRequests.push({
//     userId: user._id,
//     email: (user.email || '').trim().toLowerCase(),
//     name: data.name || user.name,
//     description: data.description || '',
//     status: 'pending'
//   });

//   await g.save();
//   return g;
// }

async function applyCandidateService(groupId, user, data) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');

  const now = new Date();
  if (g.candidateEndDate && now > g.candidateEndDate) {
    throw new Error('Candidate submission period has ended');
  }

  // האם כבר חבר?
  const alreadyCandidate = await Candidate.findOne({
    groupId,
    userId: user._id
  }).lean();
  if (alreadyCandidate) throw new Error('Already a candidate');

  // בדיקה אם כבר קיימת בקשה כלשהי של המשתמש
  const existingRequests = g.candidateRequests.filter(r => String(r.userId) === String(user._id));

  if (existingRequests.length) {
    // עדכון כל הרשומות הקיימות ל-pending עם הפרטים החדשים
    existingRequests.forEach(r => {
      r.name = data.name || user.name;
      r.description = data.description || '';
      r.status = 'pending';
    });
    await g.save();
    return existingRequests[0]; // מחזירים את הרשומה הראשונה (ניתן להתאים)
  }

  // אם אין בקשה בכלל – יוצרים חדשה
  const newReq = {
    userId: user._id,
    email: (user.email || '').trim().toLowerCase(),
    name: data.name || user.name,
    description: data.description || '',
    status: 'pending'
  };
  g.candidateRequests.push(newReq);
  await g.save();

  return newReq;
}


async function approveCandidateRequestService(groupId, ownerId, requestId) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') throw new Error('Not owner');

  const req = g.candidateRequests.id(requestId);
  if (!req) throw new Error('Request not found');

  req.status = 'approved';

  // יצירת מועמד
  const candidate = await Candidate.create({
    userId: req.userId,
    name: req.name,
    description: req.description,
    photoUrl: '',
    symbol: '',
    groupId: groupId
  });

  // // מחיקה מהרשימה
  // req.deleteOne();
  await g.save();

  return candidate;
}

async function rejectCandidateRequestService(groupId, adminId, requestId) {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  // בדיקת הרשאות
  if (group.createdById.toString() !== adminId.toString() && adminId !== 'ADMIN') {
    throw new Error("Not authorized");
  }

  const request = group.candidateRequests.id(requestId);
  if (!request) throw new Error("Request not found");

  // עדכון סטטוס לדחוי במקום מחיקה
  request.status = 'rejected';
  await group.save();

  return request; // מחזירים את הבקשה המעודכנת כדי שה-Redux יעדכן את הסטור
}



async function addCandidateByEmailService(groupId, ownerId, email, data = {}) {
  const g = await Group.findById(groupId);
  if (!g) throw new Error('Group not found');
  if (String(g.createdById) !== String(ownerId) && ownerId !== 'ADMIN') throw new Error('Not owner');

  const norm = email.trim().toLowerCase();
  const user = await User.findOne({ email: norm });
  if (!user) throw new Error('User not found');

  // לבדוק שלא קיים כבר
  const exists = await Candidate.findOne({ groupId, userId: user._id });
  if (exists) throw new Error('Candidate already exists');

  const candidate = await Candidate.create({
    userId: user._id,
    name: data.name || user.name,
    description: data.description || '',
    photoUrl: data.photoUrl || '',
    symbol: data.symbol || '',
    groupId
  });

  return candidate;
}

async function getCandidateRequestsService(groupId) {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');
  return group.candidateRequests || [];
}

async function generateGroupDescriptionService(name, hint = '') {
  // fallback אם אין מפתח
  if (!genAI || !process.env.GEMINI_API_KEY) {
    return 'קבוצה חדשה באתר ההצבעות. תיאור יתווסף בהמשך.';
  }

  const safeName = String(name || '').trim();
  const safeHint = String(hint || '').trim();

  const prompt = `
את/ה מסייע/ת ביצירת תיאור קצר לקבוצת הצבעה.

שם הקבוצה: "${safeName || 'ללא שם'}"

הנחיות מיוצר הקבוצה (לא חובה):
"${safeHint || 'ללא'}"

הוראות:
1. כתוב/י תיאור בעברית בין 2 ל-4 שורות.
2. התיאור צריך להתאים לעמוד קבוצה באתר הצבעות: ברור, מזמין, בלי סלנג קיצוני.
3. אין להשתמש באימוג׳ים, כוכביות, כותרות או רשימות – רק טקסט רגיל.
4. אל תוסיף/י פרטים שלא משתמעים מהשם או מההנחיות.
`.trim();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = (response.text() || '').trim();

  if (!text) {
    return 'קבוצה חדשה באתר ההצבעות.';
  }

  // לוודא עד 4 שורות ולא ריקות
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 4);

  return lines.join('\n') || 'קבוצה חדשה באתר ההצבעות.';
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
};
