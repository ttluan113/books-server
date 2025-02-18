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
        try {
            let { sortType, category, page = 1, limit = 10 } = req.query;

            // Chuyển đổi page và limit thành số nguyên hợp lệ
            page = Math.max(parseInt(page) || 1, 1);
            limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
            const skip = (page - 1) * limit;

            // Tạo bộ lọc sản phẩm
            let filter = {};
            if (category) filter.category = category;
            if (sortType === 'sale') filter.discount = { $gt: 0 }; // Lọc sản phẩm có giảm giá

            // Tạo điều kiện sắp xếp
            let sortOption = {};
            if (sortType === 'price_desc') sortOption.price = -1;
            else if (sortType === 'price_asc') sortOption.price = 1;
            else if (sortType === 'top_buy') sortOption.countBuy = -1;

            // Lấy danh sách sản phẩm + tổng số sản phẩm
            const [products, total] = await Promise.all([
                modelProducts
                    .find(filter)
                    .sort(sortOption)
                    .populate('category', 'nameCategory')
                    .limit(limit)
                    .skip(skip)
                    .lean(), // Tăng hiệu suất bằng cách trả về object thuần

                modelProducts.countDocuments(filter),
            ]);

            // Lấy rating từ modelFeedback và join vào sản phẩm
            const ratings = await modelFeedback.aggregate([
                { $match: { productId: { $in: products.map((p) => p._id) } } },
                { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
            ]);

            // Gán rating và tính giá giảm
            const data = products.map((item) => ({
                ...item,
                nameCategory: item.category?.nameCategory,
                price: item.price - (item.price * item.discount) / 100,
                rating: ratings.find((r) => r._id.toString() === item._id.toString())?.avgRating || 5,
            }));

            return res.status(200).json({
                data,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
            });
        } catch (error) {
            console.error(error);
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
            return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau', success: false });
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
            const {
                id,
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
            } = req.body;
            const file = req.files;

            if (!id) {
                return res.status(400).json({ message: 'Thiếu ID sản phẩm' });
            }

            const product = await modelProducts.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
            }

            // Cập nhật chỉ những trường có giá trị mới
            if (name) product.name = name;
            if (price) product.price = price;
            if (description) product.description = description;
            if (quantity) product.quantity = quantity;
            if (company) product.options.company = company;
            if (publicationDate) product.options.publicationDate = publicationDate;
            if (type) product.options.type = type;
            if (size) product.options.size = size;
            if (page) product.options.page = page;
            if (publishingHouse) product.options.publishingHouse = publishingHouse;
            if (file.length > 0) {
                product.images.forEach((item) => {
                    fs.unlink(`src/uploads/products/${item}`).catch((err) => console.log(err));
                });
                product.images = file.map((item) => item.filename);
            }

            await product.save();
            return res.status(200).json({ message: 'Cập nhật sản phẩm thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi server !!!' });
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

    async getProductFlashSale(req, res, next) {
        try {
            const products = await modelProducts.find({ discount: { $gt: 0 } });

            const ratings = await modelFeedback.aggregate([
                { $match: { productId: { $in: products.map((p) => p._id) } } },
                { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
            ]);

            const data = await Promise.all(
                products.map(async (item) => {
                    const findProduct = await modelProducts.findById(item._id);
                    return {
                        ...findProduct._doc,
                        priceNew: findProduct.price - (findProduct.price * findProduct.discount) / 100,
                        rating: ratings.find((r) => r._id.toString() === item._id.toString())?.avgRating || 5,
                        price: item.price - (item.price * item.discount) / 100,
                    };
                }),
            );
            return res.status(200).json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async searchProduct(req, res) {
        try {
            const { name } = req.query;
            const products = await modelProducts.find({
                $or: [{ name: { $regex: name, $options: 'i' } }, { description: { $regex: name, $options: 'i' } }],
            });

            const data = products.filter((item) => item.quantity > 0);

            return res.status(200).json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }
}

module.exports = new controllerProducts();
