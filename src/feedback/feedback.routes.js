const express = require('express');
const router = express.Router();

const controllerFeedback = require('./feedback.controller');

router.post('/api/add-feedback', controllerFeedback.createFeedback);

module.exports = router;
