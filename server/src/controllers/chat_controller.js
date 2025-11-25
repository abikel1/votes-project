const {
    getGroupChatService,
    addChatMessageService,
    deleteChatMessageService,
    updateChatMessageService,
    summarizeGroupChatService,
} = require('../services/chat_service');

async function getGroupChat(req, res) {
    try {
        const { id } = req.params;
        const messages = await getGroupChatService(id);
        res.json(messages);
    } catch (err) {
        console.error('getGroupChat error:', err);
        const code = err.message === 'Group not found' ? 404 : 400;
        res.status(code).json({ message: err.message || 'Chat fetch error' });
    }
}

async function sendChatMessage(req, res) {
    try {
        const { id } = req.params;
        const text = req.body?.text;

        const msg = await addChatMessageService(id, req.user, text);
        res.json({ message: msg });
    } catch (err) {
        console.error('sendChatMessage error:', err);
        const code = err.message === 'Group not found' ? 404 : 400;
        res.status(code).json({ message: err.message || 'Chat send error' });
    }
}

async function deleteChatMessage(req, res) {
    try {
        const { id, msgId } = req.params;
        const messages = await deleteChatMessageService(id, msgId, req.user);
        res.json({ ok: true, messages });
    } catch (err) {
        console.error('deleteChatMessage error:', err);
        let code = 400;
        if (err.message === 'Group not found' || err.message === 'Message not found') {
            code = 404;
        } else if (err.code === 'FORBIDDEN') {
            code = 403;
        }
        res.status(code).json({ message: err.message || 'Chat delete error' });
    }
}

async function updateChatMessage(req, res) {
    try {
        const { id, msgId } = req.params;
        const text = req.body?.text;

        const messages = await updateChatMessageService(id, msgId, req.user, text);
        res.json({ ok: true, messages });
    } catch (err) {
        console.error('updateChatMessage error:', err);
        let code = 400;
        if (err.message === 'Group not found' || err.message === 'Message not found') {
            code = 404;
        } else if (err.code === 'FORBIDDEN') {
            code = 403;
        }
        res.status(code).json({ message: err.message || 'Chat update error' });
    }
}

// סיכום צ׳אט – יוצר הודעת AI ושולח חזרה את כל ההודעות
async function getGroupChatSummary(req, res) {
    try {
        const { id } = req.params;

        const { summary, messages } = await summarizeGroupChatService(id);

        res.json({ summary, messages });
    } catch (err) {
        console.error('getGroupChatSummary error:', err);
        const code = err.message === 'Group not found' ? 404 : 400;
        res.status(code).json({ message: err.message || 'Chat summary error' });
    }
}

module.exports = {
    getGroupChat,
    sendChatMessage,
    deleteChatMessage,
    updateChatMessage,
    getGroupChatSummary,
};
