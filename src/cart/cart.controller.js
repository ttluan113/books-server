const modelCart = require('./cart.model');
const modelProducts = require('../products/products.model');
const modelDiscount = require('../discount/discount.model');
class controllerCart {
    async addCart(req, res) {
        const { id } = req.decodedToken;

        if (!id) {
            return res.status(403).json({ message: 'Vui lòng đăng nhập ' });
        }
        const { productId, quantity } = req.body;
        const findProduct = await modelProducts.findById(productId);

        if (!findProduct) {
            return res.status(400).json({ message: 'Sản phẩm không tồn tại' });
        }
        if (quantity > findProduct.quantity) {
            return res.status(400).json({ message: 'Sản phẩm trong kho không đủ ' });
        }

        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            const newCart = new modelCart({
                userId: id,
                products: [{ productId, quantity }],
                total: findProduct.price * quantity,
            });
            await findProduct.updateOne({ quantity: findProduct.quantity - quantity });

            await newCart.save();
            return res.status(200).json({ message: 'Thêm vào giỏ hàng thành công ' });
        }
        const index = cart.products.findIndex((item) => item.productId === productId);
        if (index !== -1) {
            cart.products[index].quantity += quantity;
            await findProduct.updateOne({ quantity: findProduct.quantity - quantity });
            await cart.updateOne({ total: cart.total + findProduct.price * quantity });
        } else {
            cart.products.push({ productId, quantity });
            await findProduct.updateOne({ quantity: findProduct.quantity - quantity });
            await cart.updateOne({ total: cart.total + findProduct.price * quantity });
        }
        await cart.save();
        return res.status(200).json({ message: 'Thêm vào giỏ hàng thành công ' });
    }

    async getCart(req, res) {
        try {
            const { id } = req.decodedToken;
            const cart = await modelCart.findOne({ userId: id });

            if (!cart) {
                return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
            }

            const idProducts = cart.products.map((item) => item.productId);
            const findProducts = await modelProducts.find({ _id: { $in: idProducts } });

            const discount = await modelDiscount.find({
                dateStart: { $lte: new Date() },
                dateEnd: { $gte: new Date() },
            });

            const data = findProducts.map((item) => {
                const findProduct = cart.products.find(
                    (product) => product.productId.toString() === item._id.toString(),
                );
                return {
                    images: item.images,
                    name: item.name,
                    price: item.price,
                    quantityUserBuy: findProduct.quantity,
                    id: item._id,
                };
            });

            if (cart.products.length === 0) {
                await modelDiscount.updateMany({ discount_user_used: id }, { $pull: { discount_user_used: id } });
                await modelCart.updateOne({ userId: id }, { $set: { total: 0 } });
            }

            const findUserUsedDiscount = await modelDiscount.find({ discount_user_used: id });
            findUserUsedDiscount.forEach(async (item) => {
                if (item.discount_min_value_order > cart.total) {
                    await modelDiscount.updateMany({ discount_user_used: id }, { $pull: { discount_user_used: id } });
                }
            });

            return res.status(200).json({ data, total: cart.total, discount });
        } catch (error) {
            console.log(error);

            return res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
        }
    }

    async deleteProductCart(req, res) {
        const { id } = req.decodedToken;
        const { idProduct } = req.query;

        const cart = await modelCart.findOne({ userId: id });
        const index = cart.products.findIndex((item) => item.productId === idProduct);
        if (index !== -1) {
            cart.products.splice(index, 1);
            await cart.save();
            return res.status(200).json({ message: 'Xóa sản phẩm trong giỏ hàng thành công' });
        }
        return res.status(400).json({ message: 'Sản phẩm trong giỏ hàng thất bại' });
    }

    async deleteCart(req, res) {
        const { id } = req.decodedToken;
        const cart = await modelCart.findOneAndDelete({ userId: id });
        if (!cart) {
            return res.status(400).json({ message: 'Giỏ hàng thất bại' });
        }
        return res.status(200).json({ message: 'Xóa giỏ hàng thành công' });
    }
}

module.exports = new controllerCart();
