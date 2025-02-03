const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCart = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        products: [
            {
                productId: { type: String, require: true },
                quantity: { type: Number, require: true },
            },
        ],
        total: { type: Number, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('cart', modelCart);
