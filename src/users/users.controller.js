const modelUser = require('./users.model');
const bcrypt = require('bcrypt');
const sendMailVerifyAccount = require('../services/sendMailVerifyAccount');
const { createToken, createRefreshToken } = require('../services/token');
const joi = require('joi');
const authUser = require('../services/authUser');
const CryptoJS = require('crypto-js');
const searchAddress = require('../utils/searchAddress');
const fs = require('fs/promises');
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
        const accessToken = createToken({ id: newUser._id, isAdmin: newUser.isAdmin });
        const refreshToken = createRefreshToken({ id: newUser._id, isAdmin: newUser.isAdmin });
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
            .json({ message: 'Đăng xuất thành công !!!' });
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
        const accessToken = createToken({ id: user._id, isAdmin: user.isAdmin });
        const refreshToken = createRefreshToken({ id: user._id, isAdmin: user.isAdmin });
        return res
            .setHeader('Set-Cookie', [
                `token=${accessToken}; HttpOnly; Secure; Max-Age=86400; Path=/; SameSite=Strict`,
                `refreshToken=${refreshToken}; HttpOnly; Secure; Max-Age=604800; Path=/; SameSite=Strict`, // 7 ngày cho refreshToken
                `logged=${1}; Max-Age=86400; Path=/; SameSite=Lax`,
            ])
            .status(200)
            .json({ message: 'Đăng nhập thành công !!!' });
    }

    async searchAddress(req, res) {
        const { address } = req.query;

        const result = await searchAddress(address);
        return res.status(200).json(result);
    }

    async editUser(req, res) {
        try {
            const { id } = req.decodedToken; // ID từ token đã giải mã

            // Kiểm tra ID có tồn tại
            if (!id) {
                return res.status(403).json({ message: 'Vui lòng đăng nhập' });
            }

            // Tìm người dùng hiện tại
            const findUser = await modelUser.findOne({ _id: id });
            if (!findUser) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            // Xử lý cập nhật avatar (nếu có)
            if (req.file && req.file.filename) {
                const img = req.file.filename;

                // Xóa avatar cũ nếu có
                if (findUser.avatar) {
                    try {
                        await fs.unlink(`src/uploads/avatars/${findUser.avatar}`);
                    } catch (error) {
                        console.warn(`Không thể xóa avatar cũ: ${findUser.avatar}`, error.message);
                    }
                }

                // Cập nhật avatar mới
                await modelUser.updateOne({ _id: id }, { avatar: img });
            }

            // Lấy thông tin từ body và bỏ qua các giá trị không hợp lệ
            const { fullName, phone, address } = req.body;

            const updatedFields = {};

            if (fullName) updatedFields.fullName = fullName;
            if (phone) updatedFields.phone = phone;
            if (address) updatedFields.address = address;

            // Cập nhật thông tin người dùng
            const updatedUser = await modelUser.findOneAndUpdate({ _id: id }, updatedFields, { new: true });

            // Trả về phản hồi
            return res.status(200).json({
                message: 'Cập nhật thông tin thành công',
                user: updatedUser,
            });
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
        }
    }
}

module.exports = new controllerUser();
