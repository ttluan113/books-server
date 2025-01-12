const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelDiscount = new Schema(
    {
        name: { type: String, require: true },
        discount: { type: Number, require: true },
        dateStart: { type: Date, require: true },
        dateEnd: { type: Date, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('discount', modelDiscount);
