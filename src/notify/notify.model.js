const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelNotify = new Schema(
    {
        senderId: { type: String, require: true, ref: 'user' },
        receiverId: { type: String, require: true, ref: 'user' },
        typeNotify: { type: String, enum: ['COMMENT'], require: true },
        productId: { type: String, ref: 'products' },
        content: { type: String, require: true },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('notication', modelNotify);
