const express = require('express');
const router = express.Router();

const controllerMessage = require('./message.controller');

router.post('/api/create-message', controllerMessage.createMessage);

module.exports = router;
