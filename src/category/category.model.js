const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCategory = new Schema(
    {
        nameCategory: { type: String, require: true },
        slug: { type: String, require: true },
        discount: { type: Number, require: true, default: 0 },
        dateEnd: { type: Date, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('category', modelCategory);
