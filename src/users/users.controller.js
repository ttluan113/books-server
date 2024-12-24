const modelUser = require('./users.model');
const bcrypt = require('bcrypt');
const sendMailVerifyAccount = require('../services/sendMailVerifyAccount');
const { createToken, createRefreshToken } = require('../services/token');
const joi = require('joi');
const authUser = require('../services/authUser');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const schemaRegister = joi.object({
    fullName: joi.string().required(),
    email: joi.string().email().min(6).max(30).required(),
    password: joi.string().min(6).max(30).required(),
    phone: joi
        .string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required(), // Chuỗi gồm 10 chữ số
});

class controllerUser {
    async register(req, res) {
        const { fullName, email, password, phone } = req.body;
        const { error } = schemaRegister.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Vui lòng xem lại thông tin' });
        }
        const user = await modelUser.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new modelUser({ fullName, email, password: hashPassword, phone });
        await newUser.save();
        // await sendMailVerifyAccount(email);
        const accessToken = createToken({ id: newUser._id });
        const refreshToken = createRefreshToken({ id: newUser._id });
        return res
            .setHeader('Set-Cookie', [
                `token=${accessToken}; HttpOnly; Secure; Max-Age=86400; Path=/; SameSite=Strict`,
                `refreshToken=${refreshToken}; HttpOnly; Secure; Max-Age=604800; Path=/; SameSite=Strict`, // 7 ngày cho refreshToken
                `logged=${1}; Max-Age=86400; Path=/; SameSite=Lax`,
            ])
            .status(200)
            .json({ message: 'Đăng ký thành công !!!' });
    }

    async auth(req, res) {
        const dataUser = authUser(req.cookies);
        if (!dataUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await modelUser.findOne({ _id: dataUser.id });
        const userString = JSON.stringify(user);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_KEY).toString();
        return res.status(200).json({ auth });
    }

    async logOut(req, res) {
        return res
            .setHeader('Set-Cookie', [
                `token=${''}; HttpOnly; Secure; Max-Age=0; Path=/; SameSite=Strict`,
                `refreshToken=${''}; HttpOnly; Secure; Max-Age=0; Path=/; SameSite=Strict`,
                `logged=${0}; Max-Age=0; Path=/; SameSite=Lax`,
            ])
            .status(200)
            .json({ message: 'Đăng ký thành công !!!' });
    }

    async login(req, res) {
        const { email, password } = req.body;
        const user = await modelUser.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email không tồn tại' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });
        }
        const accessToken = createToken({ id: user._id });
        const refreshToken = createRefreshToken({ id: user._id });
        return res
            .setHeader('Set-Cookie', [
                `token=${accessToken}; HttpOnly; Secure; Max-Age=86400; Path=/; SameSite=Strict`,
                `refreshToken=${refreshToken}; HttpOnly; Secure; Max-Age=604800; Path=/; SameSite=Strict`, // 7 ngày cho refreshToken
                `logged=${1}; Max-Age=86400; Path=/; SameSite=Lax`,
            ])
            .status(200)
            .json({ message: 'Đăng nhập thành công !!!' });
    }
}

module.exports = new controllerUser();
