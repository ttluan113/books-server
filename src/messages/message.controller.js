const modelMessage = require('./message.model');

class controllerMessage {
    async createMessage(req, res) {
        const { id } = req.decodedToken;
        const { content, receiverId } = req.body;
        if (!id || !content || !receiverId) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường thông tin' });
        }
        const findAdmin = await modelUser.findOne({ isAdmin: true });
        const findMessage = await modelMessage.findOne({
            senderId: id,
            receiverId: findAdmin._id,
        });
        if (!findMessage) {
            await modelMessage.create({
                content,
                senderId: id,
                receiverId: findAdmin._id,
            });
            return res.status(201).json({ message: 'Thành công' });
        }
        const newMessage = new modelMessage({
            content,
            senderId: id,
            receiverId,
        });
        await newMessage.save();
        return res.status(201).json({ message: 'Thành công' });
    }
}

module.exports = new controllerMessage();
