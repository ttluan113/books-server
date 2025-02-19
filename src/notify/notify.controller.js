const modelUser = require('../users/users.model');
const modelNotify = require('./notify.model');

const { UnauthorizedError } = require('../core/error.response');

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
                avatar: findUser?.avatar || findAdmin?.avatar,
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

            // Tìm chính xác user hiện tại, không phải bất kỳ admin nào
            const findAdmin = await modelUser.findOne({ _id: id, isAdmin: true });

            if (findAdmin) {
                const notify = await modelNotify.find({ parentId: null });
                const userNotifications = await Promise.all(
                    notify.map(async (notification) => {
                        const user = await modelUser.findOne({ _id: notification.senderId });
                        return {
                            ...notification._doc,
                            fullName: user?.fullName || 'Người dùng không tồn tại',
                            avatar: user?.avatar || null,
                        };
                    }),
                );
                return res.status(200).json(userNotifications || []);
            }

            // Nếu không phải admin, chỉ lấy notify của chính họ
            const notify = await modelNotify.find({ receiverId: id });

            const userNotifications = await Promise.all(
                notify.map(async (notification) => {
                    const user = await modelUser.findOne({ _id: notification.senderId });
                    return {
                        ...notification._doc,
                        fullName: user?.fullName || 'Người dùng không tồn tại',
                        avatar: user?.avatar || null,
                    };
                }),
            );

            return res.status(200).json(userNotifications || []);
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }

    async readNotify(req, res) {
        try {
            const { id } = req.decodedToken;
            const { type, idNotify } = req.body;
            if (type === 'all') {
                if (!id) {
                    throw new UnauthorizedError('Unauthorized');
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
            return res.status(200).json({ message: 'Thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
        }
    }
}

module.exports = new controllerNotify();
