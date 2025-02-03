const modelMessage = require('./message.model');
const modelUser = require('../users/users.model');

class controllerMessage {
    async createMessage(req, res) {
        const { id } = req.decodedToken;
        const { valueMessage, receiverId } = req.body.data;

        if (!id || !valueMessage) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường thông tin' });
        }
        const findAdmin = await modelUser.findOne({ isAdmin: true });

        if (!receiverId) {
            const findMessage = await modelMessage.findOne({ senderId: id }).lean();
            if (!findMessage) {
                const user = await modelUser.findOne({ _id: id });
                _userSockets.forEach((userSocket) => {
                    if (!receiverId || userSocket.user === findAdmin._id) {
                        userSocket.emit('newUserMessage', {
                            fullName: user.fullName,
                            avatar: user.avatar,
                            _id: id,
                        });
                    }
                });
            }
            const newMessage = await modelMessage.create({
                senderId: id,
                receiverId: findAdmin._id,
                content: valueMessage,
            });
            _userSockets.forEach((userSocket) => {
                if (!receiverId || userSocket.user === findAdmin._id) {
                    userSocket.emit('newMessage', newMessage);
                }
            });

            return res.status(201).json(newMessage);
        }

        if (receiverId) {
            const newMessage = await modelMessage.create({
                senderId: id,
                receiverId: receiverId,
                content: valueMessage,
            });
            _userSockets.forEach((userSocket) => {
                if (userSocket.user === receiverId) {
                    userSocket.emit('newMessage', newMessage);
                }
            });
            return res.status(201).json(newMessage);
        }
    }

    async getMessages(req, res) {
        try {
            const { id } = req.decodedToken;
            const findAdmin = await modelUser.findOne({ _id: id });

            if (findAdmin?.isAdmin === true) {
                // Lấy danh sách ID người gửi không trùng lặp
                const senderIds = await modelMessage.distinct('senderId', { receiverId: findAdmin._id });

                // Lấy thông tin của người gửi
                const senders = await modelUser.find({ _id: { $in: senderIds } }, 'fullName avatar');

                return res.status(200).json(senders);
            }

            // Lấy danh sách tin nhắn
            const messages = await modelMessage.find({ $or: [{ receiverId: id }, { senderId: id }] });

            return res.status(200).json(messages);

            // Nếu không phải admin, lấy tin nhắn của user
        } catch (error) {
            console.error('Error in getMessage:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async getMessage(req, res) {
        try {
            const { id } = req.decodedToken;
            if (!id) {
                return res.status(403).json({ message: 'Vui lòng đăng nhập' });
            }

            const { receiverId } = req.query;

            const messages = await modelMessage.find({
                $or: [
                    { senderId: id, receiverId: receiverId },
                    { senderId: receiverId, receiverId: id },
                ],
            });

            const data = await Promise.all(
                messages.map(async (message) => {
                    const user = await modelUser.findOne({ _id: message.senderId });
                    return {
                        ...message._doc, // Truy xuất dữ liệu gốc trong Document Mongoose
                        fullName: user?.fullName,
                        avatar: user?.avatar || null,
                    };
                }),
            );
            return res.status(200).json(data);
        } catch (error) {
            console.error('Error in getMessage:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

module.exports = new controllerMessage();
