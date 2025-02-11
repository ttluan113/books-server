const modelComments = require('./comments.model');
const modelUsers = require('../users/users.model');

const { UnauthorizedError } = require('../core/error.response');

class controllerComments {
    async addComment(req, res) {
        const { id } = req.decodedToken;
        const { productId, content, parentId } = req.body;

        if (!id) {
            throw new UnauthorizedError('Unauthorized');
        }
        if (parentId) {
            await modelComments.create({ userId: id, productId, content, parentId });
            return res.status(201).json(content);
        }
        if (!productId || !content) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }
        const newComment = await modelComments.create({ userId: id, productId, content, parentId });
        return res.status(200).json(newComment);
    }

    async getComments(req, res) {
        const { productId } = req.query;
        try {
            // Lấy tất cả các comments theo productId
            const comments = await modelComments.find({ productId }).lean();

            // Gắn thông tin user cho từng comment
            const commentsWithUser = await Promise.all(
                comments.map(async (comment) => {
                    const user = await modelUsers.findOne({ _id: comment.userId }).lean();
                    return {
                        ...comment,
                        user: {
                            avatar: user?.avatar,
                            fullName: user?.fullName,
                            createdAt: user?.createdAt,
                            isAdmin: user?.isAdmin,
                        },
                    }; // Gắn thông tin user vào comment
                }),
            );

            // Tạo một map để dễ dàng gán subcomments vào parent
            const commentMap = {};
            const rootComments = [];

            // Duyệt qua tất cả comments và phân loại
            commentsWithUser.forEach((comment) => {
                commentMap[comment._id] = { ...comment, subComments: [] };

                if (!comment.parentId) {
                    // Comment chính (không có parentId)
                    rootComments.push(commentMap[comment._id]);
                } else {
                    // Là subcomment, thêm vào subComments của parent
                    if (commentMap[comment.parentId]) {
                        commentMap[comment.parentId].subComments.push(commentMap[comment._id]);
                    }
                }
            });

            return res.status(200).json(rootComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            return res.status(500).json({ message: 'Error fetching comments' });
        }
    }
}

module.exports = new controllerComments();
