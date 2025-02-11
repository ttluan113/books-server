const modelUser = require('./users.model');
const modelApiKey = require('../apikey/apikey.model');
const modelProduct = require('../products/products.model');
const modelCategory = require('../category/category.model');

const { UnauthorizedError } = require('../core/error.response');

const bcrypt = require('bcrypt');
const sendMailVerifyAccount = require('../services/sendMailVerifyAccount');
const { createToken, createRefreshToken, createApiKey } = require('../services/token');
const joi = require('joi');
const CryptoJS = require('crypto-js');
const searchAddress = require('../utils/searchAddress');
const fs = require('fs/promises');

const { jwtDecode } = require('jwt-decode');
const { verifyToken } = require('../services/token');

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
        await createApiKey(newUser._id);
        // await sendMailVerifyAccount(email);
        const accessToken = await createToken({ id: newUser._id, isAdmin: newUser.isAdmin });
        const refreshToken = await createRefreshToken({ id: newUser._id, isAdmin: newUser.isAdmin });

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
        try {
            const { id } = req.decodedToken;
            const user = await modelUser.findOne({ _id: id });
            const userString = JSON.stringify(user);
            const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_KEY).toString();
            return res.status(201).json(auth);
        } catch (error) {
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async logOut(req, res) {
        const { id } = req.decodedToken;
        if (!id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            await modelApiKey.deleteOne({ userId: id });

            return res
                .setHeader('Set-Cookie', [
                    `token=; HttpOnly; Secure; Max-Age=0; Path=/; SameSite=Strict`,
                    `refreshToken=; HttpOnly; Secure; Max-Age=0; Path=/; SameSite=Strict`,
                    `logged=; Max-Age=0; Path=/; SameSite=Lax`,
                ])
                .status(200)
                .json({ message: 'Đăng xuất thành công' });
        } catch (error) {
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
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
        const findApiKey = await modelApiKey.findOne({ userId: user._id });
        if (!findApiKey) {
            await createApiKey(user._id);
        }
        const accessToken = await createToken({ id: user._id, isAdmin: user.isAdmin });
        const refreshToken = await createRefreshToken({ id: user._id, isAdmin: user.isAdmin });
        return res
            .setHeader('Set-Cookie', [
                `token=${accessToken}; HttpOnly; Secure; Max-Age=604800; Path=/; SameSite=Strict`,
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
                throw new UnauthorizedError('Unauthorized');
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

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { id } = jwtDecode(refreshToken);
            const findApiKey = await modelApiKey.findOne({ userId: id });
            if (!findApiKey) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const validToken = verifyToken(refreshToken, id);
            if (!validToken) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const findUser = await modelUser.findOne({ _id: id });
            const accessToken = await createToken({ id: findUser._id, isAdmin: findUser.isAdmin });
            return res
                .setHeader('Set-Cookie', [
                    `token=${accessToken}; HttpOnly; Secure; Max-Age=86400; Path=/; SameSite=Strict`,
                    `logged=${1}; Max-Age=86400; Path=/; SameSite=Lax`,
                ])
                .status(200)
                .json({ message: 'Refresh token thành công !!!' });
        } catch (error) {
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async getAllUser(req, res) {
        try {
            const users = await modelUser.find();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async lockUser(req, res) {
        try {
            const { id } = req.query;
            await modelUser.updateOne({ _id: id }, { isActive: true });
            return res.status(200).json({ message: 'Khoá tài khoản thành công' });
        } catch (error) {
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async createAddress(req, res) {
        const { id } = req.decodedToken;
        const address = req.body.data;

        if (!address) {
            return res.status(400).json({ message: 'Vui lòng nhập điểm giao hàng' });
        }

        try {
            const findUser = await modelUser.findOne({ _id: id });
            if (!findUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            findUser.addressDefault.push(address);
            await findUser.save();
            return res.status(201).json({ message: 'Thêm điểm giao hàng thành công' });
        } catch (error) {
            console.error('Error creating address:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async deleteAddress(req, res) {
        const { id } = req.decodedToken;
        const { idAddress } = req.query;

        try {
            const findUser = await modelUser.findOne({ _id: id });
            if (!findUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            findUser.addressDefault = findUser.addressDefault.filter((address) => address.id !== idAddress);
            await findUser.save();
            return res.status(200).json({ message: 'Xóa điểm giao hàng thành công' });
        } catch (error) {
            console.error('Error deleting address:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async heartProduct(req, res) {
        const { id } = req.decodedToken;
        const { productId } = req.body;
        if (!id) {
            throw new UnauthorizedError('Unauthorized');
        }
        if (!productId) {
            return res.status(400).json({ message: 'Vui lòng nhà phân phòng' });
        }
        try {
            const findUser = await modelUser.findOne({ _id: id });
            if (!findUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            const findProduct = await modelProduct.findOne({ _id: productId });
            if (!findProduct) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            if (findUser.heartProduct.includes(productId)) {
                findUser.heartProduct = findUser.heartProduct.filter((item) => item !== productId);
                await findUser.save();
                return res.status(200).json({ message: 'Bỏ yêu thích thành công', success: false });
            } else {
                findUser.heartProduct.push(productId);
                await findUser.save();
                return res.status(200).json({ message: 'Thêm yêu thích thành công', success: true });
            }
        } catch (error) {
            console.error('Error heart product:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async getHeartProduct(req, res) {
        const { id } = req.decodedToken;
        if (!id) {
            throw new UnauthorizedError('Unauthorized');
        }
        try {
            const findUser = await modelUser.findOne({ _id: id });
            if (!findUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            const { heartProduct } = findUser;
            return res.status(200).json(heartProduct);
        } catch (error) {
            console.error('Error heart product:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async getHeartProductUser(req, res) {
        const { id } = req.decodedToken;
        if (!id) {
            throw new UnauthorizedError('Unauthorized');
        }
        try {
            const findUser = await modelUser.findOne({ _id: id });
            if (!findUser) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            const { heartProduct } = findUser;
            const products = await modelProduct.find({ _id: { $in: heartProduct } });
            const data = await Promise.all(
                products.map(async (product) => {
                    const category = await modelCategory.findOne({ _id: product.category });
                    return {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        images: product.images[0],
                        category: category.nameCategory,
                    };
                }),
            );
            return res.status(200).json(data);
        } catch (error) {
            console.error('Error heart product:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }
}

module.exports = new controllerUser();
