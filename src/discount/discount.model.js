const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelDiscount = new Schema(
    {
        name: { type: String, require: true },
        dateStart: { type: Date, require: true },
        dateEnd: { type: Date, require: true },
        discount_user_used: { type: Array, default: [] },
        discount_min_value_order: { type: Number, require: true },
        discount_percent: { type: Number, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('discount', modelDiscount);
