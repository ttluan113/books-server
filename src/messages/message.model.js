const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelMessage = new Schema(
    {
        senderId: { type: String, require: true, ref: 'user' },
        receiverId: { type: String, require: true, ref: 'user' },
        content: { type: String, require: true },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('messages', modelMessage);
