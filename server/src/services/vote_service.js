// server/src/services/vote_service.js
const mongoose = require('mongoose');
const Vote = require('../models/vote_model');
const Group = require('../models/group_model');
const Candidate = require('../models/candidate_model');
const User = require('../models/user_model'); // חדש: בדיקת קיום משתמש

/**
 * יצירת הצבעה חדשה
 * @param {{ userId: string, groupId: string, candidateId: string }} voteData
 * @returns {Promise<Object>} מסמך ההצבעה שנוצר
 */
async function createVoteService(voteData) {
  const { userId, groupId, candidateId } = voteData || {};

  // ---------- בדיקות קלט ----------
  const isId = (v) => mongoose.isValidObjectId(v);
  if (!userId || !groupId || !candidateId) {
    throw new Error('Missing required fields (userId, groupId, candidateId)');
  }
  if (!isId(userId) || !isId(groupId) || !isId(candidateId)) {
    throw new Error('Invalid IDs format');
  }

  // ---------- קריאות DB בסיסיות ----------
  // מביאים במקביל לחיסכון זמן
  const [user, group, candidate] = await Promise.all([
    User.findById(userId).lean(),
    Group.findById(groupId).lean(),
    Candidate.findById(candidateId).lean(),
  ]);

  if (!user) throw new Error('User not found');
  if (!group) throw new Error('Group not found');
  if (!candidate) throw new Error('Candidate not found');

  // קבוצה לא סגורה (אם יש endDate בעבר — חוסמים הצבעה)
  if (group.endDate && new Date(group.endDate).getTime() < Date.now()) {
    throw new Error('Voting period has ended for this group');
  }

  // שייכות המועמד לקבוצה – לפי candidate.groupId בלבד (כפי שביקשת)
  if (!candidate.groupId || candidate.groupId.toString() !== groupId.toString()) {
    throw new Error('Candidate does not belong to this group');
  }

  // אין הצבעה קודמת של המשתמש בקבוצה
  const exists = await Vote.findOne({ userId, groupId }).lean();
  if (exists) throw new Error('User already voted in this group');

  // ---------- טרנזקציה למניעת חוסר-סנכרון ----------
  const session = await mongoose.startSession();
  try {
    let createdVote = null;

    await session.withTransaction(async () => {
      // 1) יוצרים את ההצבעה
      const voteDoc = new Vote({ userId, groupId, candidateId });
      await voteDoc.save({ session });

      // 2) מעדכנים מונה קולות של המועמד (אופציונלי אך מומלץ)
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
    // במקרה נדיר של מירוץ, מונגו עשוי להרים E11000 (אינדקס ייחודי על userId+groupId)
    if (e && e.code === 11000) {
      e.message = 'User already voted in this group';
    }
    throw e;
  } finally {
    session.endSession();
  }
}


// מחיקת הצבעה קיימת (לפי userId+groupId) + עדכון מונה קולות של המועמד בטרנזקציה
async function deleteVoteService(voteData) {
  const { userId, groupId } = voteData || {};
  const isId = (v) => mongoose.isValidObjectId(v);

  if (!userId || !groupId) {
    throw new Error('Missing required fields (userId, groupId)');
  }
  if (!isId(userId) || !isId(groupId)) {
    throw new Error('Invalid IDs format');
  }

  // מאתרים את ההצבעה
  const vote = await Vote.findOne({ userId, groupId }).lean();
  if (!vote) {
    throw new Error('Vote not found');
  }

  // טרנזקציה: מוחקים את ההצבעה ומפחיתים 1 מהמועמד שהצביעו לו
  const session = await mongoose.startSession();
  try {
    let deleted = null;

    await session.withTransaction(async () => {
      // מחיקה
      const delRes = await Vote.deleteOne({ _id: vote._id }, { session });
      if (delRes.deletedCount !== 1) {
        throw new Error('Failed to delete vote');
      }
      deleted = vote;

      // הפחתת מונה קולות של המועמד (אם קיים)
      if (vote.candidateId) {
        await Candidate.updateOne(
          { _id: vote.candidateId },
          { $inc: { votesCount: -1 } },
          { session }
        );
      }
    });

    console.log('🗑️ Vote deleted:', deleted);
    return deleted; // מחזיר את ההצבעה שנמחקה
  } finally {
    session.endSession();
  }
}

module.exports = { createVoteService, deleteVoteService };

