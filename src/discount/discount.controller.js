const modelDiscount = require('./discount.model');
const modelCart = require('../cart/cart.model');
const modelProducts = require('../products/products.model');
const moment = require('moment');

class controllerDiscount {
    async addDiscount(req, res) {
        const { name, dateStart, dateEnd, discount_min_value_order, discount_percent } = req.body;

        // Kiểm tra thông tin nhập vào
        if (!name || !dateStart || !dateEnd || !discount_min_value_order || !discount_percent) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường thông tin' });
        }

        // Chuyển đổi dateStart và dateEnd sang định dạng ngày bằng moment
        const startDate = moment(dateStart, 'DD/MM/YYYY', true);
        const endDate = moment(dateEnd, 'DD/MM/YYYY', true);

        // Kiểm tra định dạng ngày hợp lệ
        if (!startDate.isValid() || !endDate.isValid()) {
            return res.status(400).json({ message: 'Định dạng ngày không hợp lệ. Vui lòng sử dụng dd/MM/yyyy' });
        }

        // Kiểm tra nếu ngày bắt đầu sau ngày kết thúc
        if (startDate.isAfter(endDate)) {
            return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc' });
        }

        // Tạo mã giảm giá mới
        const newDiscount = new modelDiscount({
            name,
            dateStart: startDate.toISOString(), // Lưu dưới dạng ISO format
            dateEnd: endDate.toISOString(),
            discount_min_value_order,
            discount_percent,
        });

        // Lưu vào cơ sở dữ liệu
        await newDiscount.save();

        return res.status(201).json({ message: 'Thêm mã giảm giá thành công' });
    }

    async addUserDiscount(req, res) {
        const { id } = req.decodedToken;
        const { idDiscount } = req.body;

        if (!id) {
            return res.status(403).json({ message: 'Vui lòng đăng nhập' });
        }

        const findDiscount = await modelDiscount.findById(idDiscount);
        if (!findDiscount) {
            return res.status(400).json({ message: 'Mã giảm giá không tồn tại' });
        }

        const findCart = await modelCart.findOne({ userId: id });
        if (!findCart) {
            return res.status(400).json({ message: 'Giỏ hàng khóa' });
        }

        const idProducts = findCart?.products.map((item) => item.productId);
        const findProducts = await modelProducts.find({ _id: { $in: idProducts } });

        const data = findProducts.map((item) => {
            const findProduct = findCart.products.find(
                (product) => product.productId.toString() === item._id.toString(),
            );
            return { ...item._doc, quantityUserBuy: findProduct.quantity };
        });

        const sumPrice = data.reduce((total, item) => {
            return total + item.price * item.quantityUserBuy;
        }, 0);

        const total = sumPrice;
        if (total < findDiscount.discount_min_value_order) {
            return res.status(400).json({ message: 'Giá trị tối thiểu đơn hàng chưa hợp lệ' });
        }

        // Xóa người dùng khỏi tất cả các mã giảm giá khác nếu có
        await modelDiscount.updateMany({ discount_user_used: id }, { $pull: { discount_user_used: id } });

        // Kiểm tra nếu người dùng đã dùng mã này trước đó, loại bỏ trước khi thêm lại
        if (!findDiscount.discount_user_used.includes(id)) {
            findDiscount.discount_user_used.push(id);
            await findDiscount.save();
        }

        const newTotal = sumPrice - (sumPrice * findDiscount.discount_percent) / 100;

        // Cập nhật tổng tiền giỏ hàng
        await findCart.updateOne({ total: newTotal });

        return res.status(200).json({ message: 'Thêm mã giảm giá thành công' });
    }
}

module.exports = new controllerDiscount();
