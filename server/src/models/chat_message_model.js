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
            default: false,   // ⭐ שדה שמסמן שההודעה נמחקה לוגית
        },
    },
    { timestamps: true }  // יוצר createdAt + updatedAt
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
