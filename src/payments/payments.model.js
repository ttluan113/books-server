const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPayments = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        products: { type: Array, require: true, ref: 'cart' },
        fullName: { type: String, require: true },
        phone: { type: Number, require: true },
        address: { type: String, require: true },
        status: { type: Boolean, require: true, default: false },
        typePayments: { type: String, enum: ['COD', 'MOMO', 'VNPAY'], default: 'COD', require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('payments', modelPayments);
