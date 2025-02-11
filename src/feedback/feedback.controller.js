const modelFeedback = require('./feedback.model');

const { UnauthorizedError } = require('../core/error.response');

class controllerFeedback {
    async createFeedback(req, res) {
        const { id } = req.decodedToken;
        if (!id) {
            throw new UnauthorizedError('Unauthorized');
        }

        const { content, productId, rating } = req.body;

        if (!content || !productId || !rating) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const newFeedback = new modelFeedback({
            userId: id,
            content,
            productId,
            rating,
        });
        await newFeedback.save();
        return res.status(201).json(newFeedback);
    }
}

module.exports = new controllerFeedback();
