const modelPayments = require('../payments/payments.model');
const modelUser = require('../users/users.model');
const moment = require('moment-timezone');

class controllerStatistical {
    async getStatistical(req, res) {
        const moment = require('moment-timezone');

        try {
            let percentOrder, percentProduct, percentUser;

            // ✅ Lấy thời gian theo giờ Việt Nam
            const today = moment().tz('Asia/Ho_Chi_Minh').startOf('day').toDate();
            const tomorrow = moment().tz('Asia/Ho_Chi_Minh').endOf('day').toDate();
            const yesterday = moment(today).subtract(1, 'days').toDate();
            const sevenDaysAgo = moment(today).subtract(6, 'days').toDate();

            // 🛒 Số đơn hàng hôm qua
            const totalOrderYesterDay = await modelPayments.countDocuments({
                createdAt: { $gte: yesterday, $lt: today },
            });

            // 🛒 Số đơn hàng hôm nay
            const totalOrder = await modelPayments.countDocuments({
                createdAt: { $gte: today, $lt: tomorrow },
            });

            // 🧑‍💻 Người dùng mới hôm qua
            const resultUserYesterDay = await modelUser.countDocuments({
                createdAt: { $gte: yesterday, $lt: today },
            });

            // 🧑‍💻 Người dùng mới hôm nay
            const resultUser = await modelUser.countDocuments({
                createdAt: { $gte: today, $lt: tomorrow },
            });

            // 🛍 Sản phẩm bán hôm qua
            const resultProductYesterDay = await modelPayments.aggregate([
                { $match: { createdAt: { $gte: yesterday, $lt: today } } },
                { $unwind: '$products' },
                {
                    $group: {
                        _id: null,
                        totalSoldProductsYesterday: { $sum: '$products.quantity' },
                    },
                },
            ]);

            // 🛍 Sản phẩm bán hôm nay
            const resultProduct = await modelPayments.aggregate([
                { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
                { $unwind: '$products' },
                {
                    $group: {
                        _id: null,
                        totalSoldProducts: { $sum: '$products.quantity' },
                    },
                },
            ]);

            // 💰 Doanh thu 7 ngày gần nhất (theo thứ)
            const revenueByDay = await modelPayments.aggregate([
                {
                    $match: { createdAt: { $gte: sevenDaysAgo, $lte: tomorrow } },
                },
                {
                    $group: {
                        _id: {
                            day: { $dayOfWeek: '$createdAt' }, // Lấy thứ (1 = CN, 2 = Thứ 2, ..., 7 = Thứ 7)
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        },
                        totalRevenue: { $sum: '$totalPrice' },
                    },
                },
                { $sort: { '_id.date': 1 } },
            ]);

            // 🗓 Danh sách 7 ngày gần nhất
            const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const last7Days = [];

            for (let i = 0; i < 7; i++) {
                const currentDate = moment(sevenDaysAgo).add(i, 'days');
                last7Days.push({
                    dayOfWeek: daysOfWeek[currentDate.day()],
                    date: currentDate.format('YYYY-MM-DD'),
                    totalRevenue: 0,
                });
            }

            // 🔄 Ghép dữ liệu vào danh sách đầy đủ
            revenueByDay.forEach((item) => {
                const index = last7Days.findIndex((d) => d.date === item._id.date);
                if (index !== -1) {
                    last7Days[index].totalRevenue = item.totalRevenue;
                }
            });

            // 📊 Tính phần trăm thay đổi
            percentOrder = totalOrderYesterDay ? ((totalOrder - totalOrderYesterDay) / totalOrderYesterDay) * 100 : 0;
            percentProduct = resultProductYesterDay[0]?.totalSoldProductsYesterday
                ? ((resultProduct[0]?.totalSoldProducts - resultProductYesterDay[0]?.totalSoldProductsYesterday) /
                      resultProductYesterDay[0]?.totalSoldProductsYesterday) *
                  100
                : 0;
            percentUser = resultUserYesterDay ? ((resultUser - resultUserYesterDay) / resultUserYesterDay) * 100 : 0;

            // 🏁 Kết quả trả về
            return res.status(200).json({
                percentOrder: percentOrder.toFixed(2) || 0,
                percentProduct: percentProduct.toFixed(2) || 0,
                percentUser: percentUser.toFixed(2) || 0,
                totalOrder: totalOrder || 0,
                totalProduct: resultProduct[0]?.totalSoldProducts || 0,
                totalUser: resultUser || 0,
                formattedResult: last7Days,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Lỗi server' });
        }
    }
}

module.exports = new controllerStatistical();
