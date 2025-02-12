const modelUser = require('../users/users.model');
const { verifyToken } = require('../services/token');
const { jwtDecode } = require('jwt-decode');

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decode = jwtDecode(token);
        const validToken = await verifyToken(token, decode.id);
        if (!validToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return next();
    } catch (error) {
        console.log(error);
    }
};

const authAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decode = jwtDecode(token);
        const validToken = await verifyToken(token, decode.id);
        if (!validToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const findUser = await modelUser.findOne({ _id: decode.id });
        if (!findUser?.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        return next();
    } catch (error) {
        console.log(error);
    }
};

module.exports = { authUser, authAdmin };
