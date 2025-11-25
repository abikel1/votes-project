// server/src/models/chat_message_model.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        senderName: String,
        senderEmail: String,
        text: {
            type: String,
            required: true,
            trim: true,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        // ⭐ חדש: האם ההודעה נשלחה ע"י ה-AI
        isAi: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model('ChatMessage', chatMessageSchema);
