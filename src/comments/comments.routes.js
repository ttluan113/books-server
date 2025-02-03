const express = require('express');
const router = express.Router();

const controllerComment = require('./comments.controller');

router.post('/api/add-comment', controllerComment.addComment);
router.get('/api/comments', controllerComment.getComments);

module.exports = router;
