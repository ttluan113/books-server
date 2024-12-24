const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelUser = new Schema(
    {
        fullName: { type: String, require },
        avatar: { type: String, default: '' },
        email: { type: String, require },
        password: { type: String, require },
        isAdmin: { type: Boolean, default: false },
        phone: { type: Number, default: 0 },
        surplus: { type: Number, default: 0 },
        isActive: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('user', modelUser);
