const modelUser = require('../users/users.model');
const modelNotify = require('./notify.model');
class controllerNotify {
    async postNotify(req, res) {
        const { id } = req.decodedToken;
        const findAdmin = await modelUser.findOne({ isAdmin: true });

        const { type, userId, productId } = req.body;

        if (!findAdmin || !id) {
            return res.status(400).json({ message: 'Có lỗi xảy ra ' });
        }
        if (type === 'COMMENT') {
            await modelNotify.create({
                senderId: id,
                receiverId: userId || null,
                productId,
                content: 'Đã trả lời bình của bạn',
            });
            return res.status(201).json({ message: 'Thành công' });
        }
    }

    async getNotify(req, res) {
        try {
            const { id } = req.decodedToken;
            if (!id) {
                return res.status(403).json({ message: 'Vui lòng đăng nhập' });
            }

            const notify = await modelNotify.find({ receiverId: id });

            // Sử dụng Promise.all để chờ tất cả các tác vụ bất đồng bộ trong map
            const userNotifications = await Promise.all(
                notify.map(async (notification) => {
                    const user = await modelUser.findOne({ _id: notification.senderId });
                    return {
                        ...notification._doc, // Truy xuất dữ liệu gốc trong Document Mongoose
                        fullName: user?.fullName || 'Người dùng không tồn tại',
                        avatar: user?.avatar || null,
                    };
                }),
            );

            return res.status(200).json(userNotifications);
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
        }
    }
}

module.exports = new controllerNotify();
