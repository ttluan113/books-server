const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCart = new Schema(
    {
        userId: { type: String, require: true },
        products: [
            {
                productId: { type: String, require: true },
                quantity: { type: Number, require: true },
            },
        ],
        discount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('cart', modelCart);
