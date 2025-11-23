// server/src/services/chat_service.js
const ChatMessage = require('../models/chat_message_model');
const Group = require('../models/group_model');

async function getGroupChatService(groupId) {
    const group = await Group.findById(groupId).lean();
    if (!group) throw new Error('Group not found');

    // מחזיר גם הודעות שנמחקו (deleted=true)
    return ChatMessage.find({ groupId })
        .sort({ createdAt: 1 })
        .lean();
}

async function addChatMessageService(groupId, user, text) {
    if (!user) throw new Error('User required');
    if (!text || !text.trim()) throw new Error('Missing text');

    const group = await Group.findById(groupId).lean();
    if (!group) throw new Error('Group not found');

    const msg = await ChatMessage.create({
        groupId,
        userId: user._id,
        senderName: user.name || user.fullName || '',
        senderEmail: (user.email || '').trim().toLowerCase(),
        text: text.trim(),
        deleted: false,
    });

    return msg;
}

async function deleteChatMessageService(groupId, messageId, user) {
    if (!user) throw new Error('User required');

    const group = await Group.findById(groupId).lean();
    if (!group) throw new Error('Group not found');

    // לוודא שאכן ההודעה שייכת לקבוצה הזו
    const msg = await ChatMessage.findOne({ _id: messageId, groupId });
    if (!msg) throw new Error('Message not found');

    const isOwner = group.createdById && String(group.createdById) === String(user._id);
    const isSender = String(msg.userId) === String(user._id);

    if (!isOwner && !isSender) {
        const err = new Error('Forbidden');
        err.code = 'FORBIDDEN';
        throw err;
    }

    // ⭐ לא מוחקים מהדאטהבייס – רק מסמנים
    msg.deleted = true;
    msg.text = 'הודעה נמחקה';
    await msg.save();

    const messages = await ChatMessage.find({ groupId })
        .sort({ createdAt: 1 })
        .lean();
    return messages;
}

async function updateChatMessageService(groupId, messageId, user, text) {
    if (!user) throw new Error('User required');
    if (!text || !text.trim()) throw new Error('Missing text');

    const group = await Group.findById(groupId).lean();
    if (!group) throw new Error('Group not found');

    // גם כאן לפי groupId + _id
    const msg = await ChatMessage.findOne({ _id: messageId, groupId });
    if (!msg) throw new Error('Message not found');

    // רק מי שכתב את ההודעה יכול לערוך
    if (String(msg.userId) !== String(user._id)) {
        const err = new Error('Forbidden');
        err.code = 'FORBIDDEN';
        throw err;
    }

    msg.text = text.trim();
    msg.deleted = false;          // אם ערכו אחרי שמחקו – אפשר להחזיר למצב רגיל
    msg.updatedAt = new Date();
    await msg.save();

    const messages = await ChatMessage.find({ groupId })
        .sort({ createdAt: 1 })
        .lean();
    return messages;
}

module.exports = {
    getGroupChatService,
    addChatMessageService,
    deleteChatMessageService,
    updateChatMessageService,
};
