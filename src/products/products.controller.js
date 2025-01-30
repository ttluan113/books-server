const modelProducts = require('./products.model');
const modelFeedback = require('../feedback/feedback.model');
const modelUser = require('../users/users.model');

class controllerProducts {
    async addProduct(req, res, next) {
        try {
            const file = req.files;

            const { name, price, description, quantity, company, publicationDate, type, size, page, publishingHouse } =
                req.body;

            if (
                !file ||
                !name ||
                !price ||
                !description ||
                !quantity ||
                !company ||
                !publicationDate ||
                !type ||
                !size ||
                !page ||
                !publishingHouse
            ) {
                return res.status(400).json({ message: 'Bạn đang thiếu thông tin !!!' });
            }

            const images = file.map((item) => {
                return item.filename;
            });

            const newProduct = new modelProducts({
                images,
                name,
                price,
                description,
                quantity,
                options: {
                    company,
                    publicationDate,
                    type,
                    size,
                    page,
                    publishingHouse,
                },
                countBuy: 0,
            });
            await newProduct.save();
            return res.status(201).json({ message: 'Thêm sản phẩm thành công !!!' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async getProducts(req, res, next) {
        try {
            const products = await modelProducts.find();
            return res.status(200).json(products);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async getProduct(req, res, next) {
        try {
            const { id } = req.query;

            // Tìm sản phẩm theo ID
            const product = await modelProducts.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            // Lấy danh sách sản phẩm cùng thương hiệu
            const brandProducts = await modelProducts.find({ 'options.company': product.options?.company });

            // Lấy danh sách feedback
            const feedback = await modelFeedback.find({ productId: id });

            // Xử lý thông tin người dùng cho từng feedback
            const feedbackUser = await Promise.all(
                feedback.map(async (item) => {
                    const findUser = await modelUser.findById(item.userId);
                    return {
                        ...item._doc,
                        name: findUser?.fullName || 'Người dùng ẩn danh',
                        avatar: findUser?.avatar || null,
                    };
                }),
            );

            // Trả về kết quả
            return res.status(200).json({ product, brandProducts, feedbackUser });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
            return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }
}

module.exports = new controllerProducts();
