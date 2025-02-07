const modelUser = require('../models/user');

const authUser = async (req, res, next) => {
    const { id } = req.decodedToken;
    const findUser = await modelUser.findOne({ _id: id });
    if (!findUser) {
        return res.status(401).json({ message: 'User not found' });
    }
    if (findUser.isAdmin === true) {
        return res.status(200).json({ success: true });
    }
    if (findUser.isAdmin === false) {
        return res.status(401).json({ message: 'User is not admin' });
    }
    return next();
};

module.exports = authUser;
