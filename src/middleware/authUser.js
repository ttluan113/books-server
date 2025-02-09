const modelUser = require('../users/users.model');
const cookies = require('cookie-parser');

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return next();
    } catch (error) {
        console.log(error);
    }
};

module.exports = authUser;
