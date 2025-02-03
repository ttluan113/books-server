const modelUser = require('../users/users.model');
const modelNotify = require('./notify.model');
class controllerNotify {
    async postNotify(req, res) {
        const { id } = req.decodedToken;
        const findAdmin = await modelUser.findOne({ isAdmin: true });
        const findUser = await modelUser.findOne({ _id: id });

        const { type, userId, productId } = req.body;

        if (!findAdmin || !id) {
            return res.status(400).json({ message: 'Bạn đang thiếu thông tin' });
        }

        if (type === 'COMMENT') {
            const data = await modelNotify.create({
                senderId: id,
                receiverId: userId || null,
                productId,
                content: !userId ? 'Đã bình luận sản phẩm' : 'Đã phản hồi bình luận của bạn',
                fullName: findUser?.fullName || findAdmin?.fullName,
            });

            const notifyData = {
                ...data.toObject(),
                fullName: findUser?.fullName || findAdmin?.fullName,
            };

            _userSockets.forEach((userSocket) => {
                if (userSocket.user === userId) {
                    userSocket.emit('notifyComment', notifyData);
                }
                if (!userId || userSocket.user === findAdmin._id) {
                    userSocket.emit('notifyComment', notifyData);
                }
            });
            return res.status(201).json({ message: 'Thành công' });
        }
    }

    async getNotify(req, res) {
        try {
            const { id } = req.decodedToken;

            const findAdmin = await modelUser.findOne({ isAdmin: true });

            if (!id) {
                return res.status(403).json({ message: 'Vui lòng đăng nhập' });
            }

            if (findAdmin.isAdmin === true) {
                const notify = await modelNotify.find({ parentId: null });
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
                return res.status(200).json(userNotifications || []);
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

            return res.status(200).json(userNotifications || []);
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
        }
    }

    async readNotify(req, res) {
        try {
            const { id } = req.decodedToken;
            const { type, idNotify } = req.body;
            if (type === 'all') {
                if (!id) {
                    return res.status(403).json({ message: 'Vui lòng đăng nhập' });
                }
                const findUser = await modelUser.findOne({ _id: id });
                if (findUser.isAdmin === true) {
                    await modelNotify.updateMany({ receiverId: null }, { isRead: true });
                    return res.status(200).json({ message: 'Thành công' });
                }

                await modelNotify.updateMany({ receiverId: id }, { isRead: true });
                return res.status(200).json({ message: 'Thành công' });
            }
            if (type === 'one') {
                await modelNotify.updateOne({ _id: idNotify }, { isRead: true });
                return res.status(200).json({ message: 'Thành công' });
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
        }
    }
}

module.exports = new controllerNotify();
