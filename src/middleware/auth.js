const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies;
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate' });
    }
};
