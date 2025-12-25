const ChatMessage = require('../models/chat_message_model');
const Group = require('../models/group_model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGroupChatService(groupId) {
    const group = await Group.findById(groupId).lean();
    if (!group) throw new Error('Group not found');

    return ChatMessage.find({ groupId })
        .sort({ createdAt: 1 })
        .lean();
}

async function addChatMessageService(groupId, user, text) {
    if (!user) throw new Error('User required');
    if (!text || !text.trim()) throw new Error('Missing text');

    const group = await Group.findById(groupId).lean();
    if (!group) throw new Error('Group not found');

    const senderName =
        (user.firstName && user.lastName)
            ? `${user.firstName} ${user.lastName}`
            : user.firstName ||
            user.lastName ||
            user.name ||
            user.fullName ||
            (user.email ? user.email.split('@')[0] : '');

    const msg = await ChatMessage.create({
        groupId,
        userId: user._id,
        senderName,
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

    const msg = await ChatMessage.findOne({ _id: messageId, groupId });
    if (!msg) throw new Error('Message not found');

    const isOwner =
        group.createdById && String(group.createdById) === String(user._id);
    const isSender = String(msg.userId) === String(user._id);

    if (!isOwner && !isSender) {
        const err = new Error('Forbidden');
        err.code = 'FORBIDDEN';
        throw err;
    }

    const deletedByOwner = isOwner && !isSender;

    msg.deleted = true;
    msg.text = deletedByOwner
        ? 'ההודעה נמחקה על ידי המנהל'
        : 'הודעה נמחקה';

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

    const msg = await ChatMessage.findOne({ _id: messageId, groupId });
    if (!msg) throw new Error('Message not found');

    if (String(msg.userId) !== String(user._id)) {
        const err = new Error('Forbidden');
        err.code = 'FORBIDDEN';
        throw err;
    }

    msg.text = text.trim();
    msg.deleted = false;
    msg.updatedAt = new Date();
    await msg.save();

    const messages = await ChatMessage.find({ groupId })
        .sort({ createdAt: 1 })
        .lean();
    return messages;
}

async function summarizeWithAI(groupName, messages) {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }

    const lastMessages = messages.slice(-50);

    const chatText = lastMessages
        .map((m) => {
            const name = m.senderName || m.senderEmail || 'משתתף';
            const text = (m.text || '').replace(/\s+/g, ' ').trim();
            if (!text) return null;
            return `${name}: ${text}`;
        })
        .filter(Boolean)
        .join('\n');

    if (!chatText) {
        return 'אין עדיין תוכן לסיכום.';
    }

    const prompt = `
זהו צ'אט של קבוצה בשם "${groupName}".

הודעות אחרונות:
${chatText}

הוראות:
1. כתבי סיכום קצר של השיחה בעברית, עד 2–3 משפטים בלבד.
2. אל תשתמשי בנקודות תבליט, כותרות או מספרים כלל.
3. אל תכתבי בשום אופן שמות של אנשים (החליפי ל"המשתתפים" או "הקבוצה").
4. תתמקדי בנושא הכללי של השיחה ומה פחות או יותר דיברו שם, בלי להיכנס לפרטים מיותרים.
5. אל תמציאי מידע שלא מופיע בהודעות.
`.trim();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = (response.text() || '').trim();

    if (!text) return null;

    const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const shortLines = lines.slice(0, 3);

    return shortLines.join('\n').trim() || null;
}

async function summarizeGroupChatService(groupId) {
    const group = await Group.findById(groupId).lean();
    if (!group) throw new Error('Group not found');

    const messages = await ChatMessage.find({ groupId, deleted: false })
        .sort({ createdAt: 1 })
        .lean();

    if (!messages.length) {
        return {
            summary: 'אין עדיין פעילות בצ׳אט.',
            messages: await ChatMessage.find({ groupId }).sort({ createdAt: 1 }).lean(),
        };
    }
    let finalSummary = null;
    try {
        const aiSummary = await summarizeWithAI(group.name || 'הקבוצה', messages);
        if (aiSummary) {
            finalSummary = aiSummary;
        }
    } catch (err) {
        console.error('AI chat summary error:', err);
    }

    if (!finalSummary) {
        const lastMessages = messages.slice(-30);
        const texts = lastMessages.map((m) => m.text || '').filter(Boolean);

        const senders = new Set(
            lastMessages.map((m) => m.senderName || m.senderEmail || '').filter(Boolean)
        );

        const total = messages.length;
        const participants = senders.size || 1;

        const allLower = texts.join(' ').toLowerCase();
        let topic = 'דיון כללי בקבוצה';

        if (
            allLower.includes('בחיר') ||
            allLower.includes('הצבע') ||
            allLower.includes('קלפי') ||
            allLower.includes('קולות') ||
            allLower.includes('מועמד')
        ) {
            topic = 'שיחה סביב הבחירות וההצבעות בקבוצה';
        } else if (
            allLower.includes('היי') ||
            allLower.includes('מה קורה') ||
            allLower.includes('מה נשמע')
        ) {
            topic = 'שיחת היכרות / שיחה קלילה בין המשתתפים';
        }

        const last = lastMessages[lastMessages.length - 1];
        let lastPreview = (last.text || '').trim();
        if (lastPreview.length > 60) {
            lastPreview = lastPreview.slice(0, 57) + '...';
        }

        finalSummary =
            `יש בצ׳אט ${total} הודעות מ־${participants} משתתפים. ` +
            `עיקר השיחה: ${topic}. ` +
            (lastPreview ? `ההודעה האחרונה: "${lastPreview}".` : '');
    }

    await ChatMessage.create({
        groupId,
        userId: group._id,
        senderName: 'AI',
        senderEmail: 'ai@chat',
        text: finalSummary,
        deleted: false,
        isAi: true,
    });

    const allMessages = await ChatMessage.find({ groupId })
        .sort({ createdAt: 1 })
        .lean();

    return {
        summary: finalSummary,
        messages: allMessages,
    };
}

module.exports = {
    getGroupChatService,
    addChatMessageService,
    deleteChatMessageService,
    updateChatMessageService,
    summarizeGroupChatService,
};
