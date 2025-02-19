const modelCart = require('../cart/cart.model');
const modelProduct = require('../products/products.model');
const cron = require('node-cron');

const cronJobsCart = async () => {
    try {
        const findAllCart = await modelCart.find();

        for (const item of findAllCart) {
            if (item.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                // Xóa giỏ hàng cũ
                await modelCart.deleteOne({ _id: item._id });

                // Trả lại số lượng sản phẩm về kho
                const bulkUpdate = item.products.map((product) => ({
                    updateOne: {
                        filter: { _id: product.productId },
                        update: { $inc: { quantity: product.quantity } },
                    },
                }));

                if (bulkUpdate.length > 0) {
                    await modelProduct.bulkWrite(bulkUpdate);
                }
            }
        }
    } catch (error) {
        console.error('Lỗi khi chạy cron job giỏ hàng:', error);
    }
};

// Chạy cron job chạy sau 10 phút
cron.schedule('* * * * *', cronJobsCart);

module.exports = cronJobsCart;
