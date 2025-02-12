const express = require('express');
const router = express.Router();

const { authUser } = require('../middleware/authUser');

const controllerComment = require('./comments.controller');

router.post('/api/add-comment', authUser, controllerComment.addComment);
router.get('/api/comments', controllerComment.getComments);

module.exports = router;
