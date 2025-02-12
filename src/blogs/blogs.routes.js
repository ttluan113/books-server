const express = require('express');
const router = express.Router();

const { authAdmin } = require('../middleware/authUser');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/blogs');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const controllerBlogs = require('./blogs.controller');

router.post('/api/create-blog', authAdmin, upload.single('image'), controllerBlogs.postBlog);
router.get('/api/blogs', controllerBlogs.getAllBlogs);
router.get('/api/blog', controllerBlogs.getOneBlog);
router.delete('/api/delete-blog', authAdmin, controllerBlogs.deleteBlog);

module.exports = router;
