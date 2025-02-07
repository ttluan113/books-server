const modelProducts = require('../products/products.model');

class controllerDiscountProduct {
    async createDiscountProduct(req, res) {
        const { arrayIdProduct, discount, dateEnd } = req.body;

        if (!arrayIdProduct || !discount || !dateEnd) {
            return res.status(400).json({ message: 'Bạn đang thiếu thông tin' });
        }

        try {
            // Tìm tất cả sản phẩm cùng lúc (tránh lặp nhiều lần)
            const products = await modelProducts.find({ _id: { $in: arrayIdProduct } });

            if (products.length !== arrayIdProduct.length) {
                return res.status(404).json({ message: 'Có sản phẩm không tồn tại' });
            }

            // Cập nhật tất cả sản phẩm một lần duy nhất
            await modelProducts.updateMany({ _id: { $in: arrayIdProduct } }, { discount, dateEnd });

            return res.status(200).json({ message: 'Tạo khuyến mãi thành công' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getDiscountProduct(req, res) {
        try {
            const products = await modelProducts.find({ discount: { $ne: null }, dateEnd: { $gte: new Date() } });

            return res.status(200).json(products);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new controllerDiscountProduct();
