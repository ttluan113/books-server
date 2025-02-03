const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelComments = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        productId: { type: String, require: true, ref: 'products' },
        content: { type: String, require: true },
        parentId: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('comment', modelComments);
