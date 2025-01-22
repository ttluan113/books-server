const modelComments = require('./comments.model');

class controllerComments {
    async addComment(req, res) {
        const { id } = req.decodedToken;
        const { productId, content, idRelyComment } = req.body;
        if (idRelyComment && productId) {
            await modelComments.updateOne(
                { _id: idRelyComment },
                { $push: { subComment: new modelComments({ userId: id, productId, content }) } },
            );
            return res.status(201).json({ success: true });
        }
        if (!id) return res.status(403).json({ message: 'Vui lòng đăng nhập' });
        if (!productId || !content) return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        const newComment = new modelComments({ userId: id, productId, content });
        await newComment.save();
        return res.status(201).json({ success: true });
    }

    async getComments(req, res) {
        const { productId } = req.query;
        const comments = await modelComments.find({ productId });
        return res.status(200).json(comments);
    }
}

module.exports = new controllerComments();
