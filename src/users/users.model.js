const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelUser = new Schema(
    {
        fullName: { type: String, require: true },
        avatar: { type: String, default: '' },
        email: { type: String, require: true },
        password: { type: String, require: true },
        isAdmin: { type: Boolean, default: false },
        phone: { type: Number, default: 0 },
        isActive: { type: Boolean, default: false },
        addressDefault: [
            {
                fullName: String,
                phone: String,
                address: String,
            },
        ],

        heartProduct: [{ type: String, default: '', ref: 'products' }],
        refreshToken: { type: Array, default: [] },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('user', modelUser);
