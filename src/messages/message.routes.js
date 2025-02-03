const express = require('express');
const router = express.Router();

const controllerMessage = require('./message.controller');

router.post('/api/create-message', controllerMessage.createMessage);
router.get('/api/messages', controllerMessage.getMessages);
router.get('/api/message', controllerMessage.getMessage);

module.exports = router;
