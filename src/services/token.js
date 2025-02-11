const jwt = require('jsonwebtoken');
const modelApiKey = require('../apikey/apikey.model');
const crypto = require('crypto');

const { UnauthorizedError } = require('../core/error.response');

require('dotenv').config();

const createApiKey = async (userId) => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

    const privateKeyString = privateKey.export({ type: 'pkcs8', format: 'pem' });
    const publicKeyString = publicKey.export({ type: 'spki', format: 'pem' });

    const newApiKey = new modelApiKey({ userId, publicKey: publicKeyString, privateKey: privateKeyString });
    return await newApiKey.save();
};

const createToken = async (payload) => {
    const findApiKey = await modelApiKey.findOne({ userId: payload.id.toString() });

    if (!findApiKey?.privateKey) {
        throw new Error('Private key not found for user');
    }

    return jwt.sign(payload, findApiKey.privateKey, {
        algorithm: 'RS256', // Quan trọng: Phải chỉ định thuật toán khi dùng RSA
        expiresIn: '15m',
    });
};

const createRefreshToken = async (payload) => {
    const findApiKey = await modelApiKey.findOne({ userId: payload.id.toString() });

    if (!findApiKey?.privateKey) {
        throw new Error('Private key not found for user');
    }

    return jwt.sign(payload, findApiKey.privateKey, {
        algorithm: 'RS256',
        expiresIn: '7d',
    });
};

const verifyToken = async (token, userId) => {
    const findApiKey = await modelApiKey.findOne({ userId });
    try {
        if (!findApiKey?.publicKey) {
            throw new UnauthorizedError('Unauthorized');
        }

        return jwt.verify(token, findApiKey.publicKey, { algorithms: ['RS256'] });
    } catch (error) {}
};

module.exports = { createToken, createRefreshToken, verifyToken, createApiKey };
