const jwt = require('jsonwebtoken');
require('dotenv').config();

const authUser = (cookies) => {
    const { token } = cookies;
    if (!token) {
        return null;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
};

module.exports = authUser;
