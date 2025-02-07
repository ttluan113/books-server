const modelCategory = require('./category.model');
const modelProducts = require('../products/products.model');
const slugify = require('slugify');
const fs = require('fs/promises');

class controllerCategory {
    async createCategory(req, res) {
        const { valueCategory } = req.body;
        if (!valueCategory) {
            return res.status(400).json({ message: 'Vui lòng nhập danh sách' });
        }
        const slugCategory = slugify(valueCategory, {
            replacement: '-', // thay thế khoảng trắng bằng ký tự thay thế, mặc định là `-`
            remove: undefined, // xóa các ký tự khớp với regex, mặc định là `undefined`
            lower: true, // chuyển thành chữ thường, mặc định là `false`
            strict: false, // xóa các ký tự đặc biệt ngoại trừ replacement, mặc định là `false`
            locale: 'vi', // mã ngôn ngữ của bản địa cần sử dụng
            trim: true, // cắt các ký tự thay thế ở đầu và cuối, mặc định là `true`
        });

        try {
            await modelCategory.create({
                nameCategory: valueCategory,
                slug: slugCategory,
            });
            return res.status(200).json({ success: true, message: 'Thêm danh mục thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async getCategory(req, res) {
        const { nameCategory } = req.query;
        try {
            if (!nameCategory) {
                const category = await modelCategory.find();
                const data = await Promise.all(
                    category.map(async (item) => {
                        const lengthProduct = await modelProducts.find({ category: item._id });
                        return {
                            ...item._doc,
                            lengthProduct: lengthProduct.length,
                        };
                    }),
                );
                return res.status(200).json(data);
            }
            const category = await modelCategory.findOne({ nameCategory });

            return res.status(200).json(category);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async deleteCategory(req, res) {
        const { id } = req.query;
        try {
            await modelCategory.findByIdAndDelete(id);
            const products = await modelProducts.find({ category: id });
            products.forEach((item) => {
                fs.unlink(`src/uploads/products/${item.images}`).catch((err) => console.log(err));
            });
            await modelProducts.deleteMany({ category: id });
            return res.status(200).json({ message: 'Xóa danh sách thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async updateCategory(req, res) {
        const { valueCategory, id } = req.body.data;
        if (!valueCategory) {
            return res.status(400).json({ message: 'Vui lòng nhập danh sách' });
        }
        if (!id) {
            return res.status(400).json({ message: 'Vui lòng chọn danh sách' });
        }
        try {
            const category = await modelCategory.findByIdAndUpdate(id, { nameCategory: valueCategory });
            return res.status(200).json(category);
        } catch (error) {
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }
}

module.exports = new controllerCategory();
