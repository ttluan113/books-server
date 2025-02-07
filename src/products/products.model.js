const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelProducts = new Schema(
    {
        images: { type: Array, require: true },
        name: { type: String, require: true },
        price: { type: Number, require: true },
        description: { type: String, require: true },
        quantity: { type: Number, require: true },
        category: { type: String, require: true, ref: 'category' },
        discount: { type: Number, require: true, default: 0 },
        options: {
            company: { type: String, require: true },
            publicationDate: { type: String, require: true },
            type: { type: String, require: true },
            size: { type: String, require: true },
            page: { type: String, require: true },
            publishingHouse: { type: String, require: true },
        },
        countBuy: { type: Number, require: true },

        dateEnd: { type: Date },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('products', modelProducts);
