const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelFeedback = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        productId: { type: String, require: true, ref: 'products' },
        content: { type: String, require: true },
        rating: { type: Number, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('feedback', modelFeedback);
