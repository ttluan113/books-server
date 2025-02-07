const modelProducts = require('./products.model');
const modelFeedback = require('../feedback/feedback.model');
const modelUser = require('../users/users.model');
const modelCategory = require('../category/category.model');

const fs = require('fs/promises');

class controllerProducts {
    async addProduct(req, res, next) {
        try {
            const file = req.files;

            const {
                name,
                price,
                description,
                quantity,
                company,
                publicationDate,
                type,
                size,
                page,
                publishingHouse,
                category,
            } = req.body;

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
                !publishingHouse ||
                !category
            ) {
                return res.status(400).json({ message: 'Bạn đang thiếu thông tin !!!' });
            }

            const images = file.map((item) => {
                return item.filename;
            });

            const findCategory = await modelCategory.findOne({ nameCategory: category });

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
                category: findCategory._id,
            });
            await newProduct.save();
            return res.status(201).json({ message: 'Thêm sản phẩm thành công !!!' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: 'Server error !!!' });
        }
    }

    async getProducts(req, res, next) {
        const { sortType, category, page, limit } = req.query;
        const skip = (page - 1) * limit;

        try {
            let filter = {};
            if (category) {
                filter.category = category; // Lọc theo danh mục nếu có
            }

            let sortOption = {};
            if (sortType === 'price_desc') {
                sortOption.price = -1;
            } else if (sortType === 'price_asc') {
                sortOption.price = 1;
            } else if (sortType === 'top_buy') {
                sortOption.countBuy = -1;
            } else if (sortType === 'sale') {
                filter.discount = { $gt: 0 }; // Chỉ lấy sản phẩm đang giảm giá
            }

            // Lấy danh sách sản phẩm theo bộ lọc và sắp xếp
            const products = await modelProducts
                .find(filter)
                .sort(sortOption)
                .populate('category', 'nameCategory')
                .limit(limit)
                .skip(skip);

            /// get feedback
            const valueRating = await modelFeedback.aggregate([
                {
                    $group: { _id: '$productId', avgRating: { $avg: '$rating' } },
                },
            ]);

            // Tính toán giá sau khi giảm giá
            const data = products.map((item) => ({
                ...item._doc,
                nameCategory: item.category?.nameCategory,
                price: item.price - (item.price * item.discount) / 100,
                rating: valueRating.find((value) => value._id.toString() === item._id.toString())?.avgRating || 0,
            }));

            return res.status(200).json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async getProduct(req, res, next) {
        try {
            const { id } = req.query;

            // Tìm sản phẩm theo ID
            const dataProduct = await modelProducts.findById(id);
            const product = {
                ...dataProduct._doc,
                price: dataProduct.price - (dataProduct.price * dataProduct.discount) / 100,
            };
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            // Lấy danh sách sản phẩm cùng thương hiệ
            const brandProducts = await modelProducts.find({
                category: product.category,
                company: product.company, // Lọc theo thương hiệu
                _id: { $ne: product._id }, // Loại trừ chính nó khỏi danh sách
            });

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

    async deleteProduct(req, res, next) {
        try {
            const { id } = req.query;
            const product = await modelProducts.findByIdAndDelete(id);
            product.images.forEach((item) => {
                fs.unlink(`src/uploads/products/${item}`).catch((err) => console.log(err));
            });
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
            }
            return res.status(200).json({ message: 'Xóa sản phẩm thành công' });
        } catch (error) {
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async editProduct(req, res, next) {
        try {
            // const { id } = req.body;
            // const { name, price, description, quantity, company, publicationDate, type, size, page, publishingHouse } =
            //     req.body;
            // const file = req.files;
            // if (
            //     !name ||
            //     !price ||
            //     !description ||
            //     !quantity ||
            //     !company ||
            //     !publicationDate ||
            //     !type ||
            //     !size ||
            //     !page ||
            //     !publishingHouse
            // ) {
            //     return res.status(400).json({ message: 'Vui lý nhập dữ liệu' });
            // }
            // const product = await modelProducts.findById(id);
            // if (!product) {
            //     return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
            // }
            // product.name = name;
            // product.price = price;
            // product.description = description;
            // product.quantity = quantity;
            // product.options.company = company;
            // product.options.publicationDate = publicationDate;
            // product.options.type = type;
            // product.options.size = size;
            // product.options.page = page;
            // product.options.publishingHouse = publishingHouse;
            // if (file) {
            //     product.images = file;
            // }
            // await product.save();
            // return res.status(200).json({ message: 'Chiềnh sách sản phẩm thành cong' });
            console.log(req.body);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async getProductsTopBuy(req, res, next) {
        try {
            const products = await modelProducts.find().sort({ countBuy: -1 }).limit(5);
            return res.status(200).json(products);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }
}

module.exports = new controllerProducts();
