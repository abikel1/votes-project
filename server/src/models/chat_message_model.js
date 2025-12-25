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
        isAi: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model('ChatMessage', chatMessageSchema);
