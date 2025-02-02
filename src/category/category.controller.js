const modelCategory = require('./category.model');

class controllerCategory {
    async createCategory(req, res) {
        const { valueCategory } = req.body;
        if (!valueCategory) {
            return res.status(400).json({ message: 'Vui lòng nhập danh sách' });
        }
        try {
            await modelCategory.create({
                nameCategory: valueCategory,
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
                return res.status(200).json(category);
            }
            const category = await modelCategory.findOne({ nameCategory });
            return res.status(200).json(category);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }
}

module.exports = new controllerCategory();
