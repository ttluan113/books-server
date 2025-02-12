const express = require('express');
const router = express.Router();

const controllerFeedback = require('./feedback.controller');

const { authUser } = require('../middleware/authUser');

router.post('/api/add-feedback', authUser, controllerFeedback.createFeedback);

module.exports = router;
