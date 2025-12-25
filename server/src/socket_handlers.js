const jwt = require('jsonwebtoken');
const User = require('./models/user_model');
const {
    addChatMessageService,
    deleteChatMessageService,
    updateChatMessageService,
    summarizeGroupChatService,
} = require('./services/chat_service');

module.exports = function initSocket(io) {
    io.use(async (socket, next) => {
        try {
            let rawAuth =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization ||
                '';

            if (!rawAuth) {
                return next(new Error('Unauthorized: missing token'));
            }

            let token = rawAuth.startsWith('Bearer ')
                ? rawAuth.slice('Bearer '.length)
                : rawAuth;

            if (!token) {
                return next(new Error('Unauthorized: empty token'));
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET);

            const userId =
                payload.id ||
                payload._id ||
                payload.userId ||
                payload.sub;

            if (!userId) {
                console.error('Socket auth: bad payload', payload);
                return next(new Error('Invalid token payload'));
            }

            const user = await User.findById(userId).lean();
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            console.error('Socket auth error:', err.message);
            next(new Error('Unauthorized'));
        }
    });



    io.on('connection', (socket) => {
        console.log('🔌 Socket connected', socket.id, socket.user?.email);
        socket.on('join-group-chat', ({ groupId }) => {
            if (!groupId) return;
            const room = `group:${groupId}`;
            socket.join(room);
        });
        socket.on('chat:send', async ({ groupId, text }, callback) => {
            try {
                if (!groupId || !text || !text.trim()) {
                    throw new Error('Missing groupId or text');
                }

                const user = socket.user;
                if (!user) throw new Error('User required');

                const msg = await addChatMessageService(groupId, user, text);

                const room = `group:${groupId}`;
                io.to(room).emit('chat:new-message', msg);

                if (callback) {
                    callback({ ok: true, message: msg });
                }
            } catch (err) {
                console.error('chat:send error:', err.message);
                if (callback) {
                    callback({ ok: false, message: err.message });
                }
            }
        });

        socket.on('chat:update', async ({ groupId, messageId, text }, callback) => {
            try {
                if (!groupId || !messageId || !text || !text.trim()) {
                    throw new Error('Missing fields');
                }

                const user = socket.user;
                if (!user) throw new Error('User required');

                const messages = await updateChatMessageService(
                    groupId,
                    messageId,
                    user,
                    text
                );

                const room = `group:${groupId}`;
                const updatedMsg = messages.find(
                    (m) => String(m._id) === String(messageId)
                );

                if (updatedMsg) {
                    io.to(room).emit('chat:message-updated', updatedMsg);
                }

                if (callback) callback({ ok: true });
            } catch (err) {
                console.error('chat:update error:', err.message);
                if (callback) callback({ ok: false, message: err.message });
            }
        });

        socket.on('chat:delete', async ({ groupId, messageId }, callback) => {
            try {
                if (!groupId || !messageId) throw new Error('Missing fields');

                const user = socket.user;
                if (!user) throw new Error('User required');

                const messages = await deleteChatMessageService(
                    groupId,
                    messageId,
                    user
                );

                const room = `group:${groupId}`;
                const deletedMsg = messages.find(
                    (m) => String(m._id) === String(messageId)
                );

                if (deletedMsg) {
                    io.to(room).emit('chat:message-deleted', deletedMsg);
                }

                if (callback) callback({ ok: true });
            } catch (err) {
                console.error('chat:delete error:', err.message);
                if (callback) callback({ ok: false, message: err.message });
            }
        });

        socket.on('chat:summarize', async ({ groupId }, callback) => {
            try {
                if (!groupId) throw new Error('Missing groupId');
                const { summary, messages } = await summarizeGroupChatService(groupId);

                const room = `group:${groupId}`;
                io.to(room).emit('chat:summary-done', {
                    summary,
                    messages,
                });

                if (callback) {
                    callback({ ok: true });
                }
            } catch (err) {
                console.error('chat:summarize error:', err.message);
                if (callback) {
                    callback({ ok: false, message: err.message });
                }
            }
        });
        socket.on('disconnect', () => {
        });
    });
};
