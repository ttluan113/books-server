const jwt = require('jsonwebtoken');
const modelApiKeys = require('../apiKeys/apiKeys.model');
const { verifyToken } = require('../services/token');
const cookieParser = require('cookie-parser');

const auth = async (req, res, next) => {};

module.exports = auth;
