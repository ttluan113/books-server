const modelMessage = require('./message.model');
const modelUser = require('../users/users.model');

class controllerMessage {
    async createMessage(req, res) {
        const { id } = req.decodedToken;
        const { valueMessage } = req.body;
        if (!id || !valueMessage) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường thông tin' });
        }
        const findAdmin = await modelUser.findOne({ isAdmin: true });

        const newMessage = await modelMessage.create({
            senderId: id,
            receiverId: findAdmin._id,
            content: valueMessage,
        });
        return res.status(201).json(newMessage);
    }

    async getMessage(req, res) {
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
            const messages = await modelMessage.find({ receiverId: id });

            return res.status(200).json(messages);

            // Nếu không phải admin, lấy tin nhắn của user
        } catch (error) {
            console.error('Error in getMessage:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

module.exports = new controllerMessage();
