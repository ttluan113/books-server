const modelBlogs = require('./blog.model');
const fs = require('fs/promises');

class controllerBlogs {
    async postBlog(req, res) {
        const { content, nameBlog } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }
        const img = req.file.filename;

        if (!content || !nameBlog || !img) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        try {
            const blog = new modelBlogs({
                nameBlog,
                image: img,
                content,
            });
            await blog.save();
            return res.status(201).json({ message: 'Tạo blog thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async getAllBlogs(req, res) {
        try {
            const blogs = await modelBlogs.find();
            return res.status(200).json(blogs);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async getOneBlog(req, res) {
        try {
            const { idBlog } = req.query;
            if (!idBlog) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
            }
            const blog = await modelBlogs.findById(idBlog);
            return res.status(200).json(blog);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async deleteBlog(req, res) {
        const { idBlog } = req.query;
        if (!idBlog) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }
        try {
            const dataBlog = await modelBlogs.findByIdAndDelete(idBlog);
            await fs.unlink(`src/uploads/blogs/${dataBlog.image}`).catch((err) => console.log(err));
            return res.status(200).json({ message: 'Xoá bài viết thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Loi server' });
        }
    }
}

module.exports = new controllerBlogs();
