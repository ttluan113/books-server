const express = require('express');
const router = express.Router();

const controllerMessage = require('./message.controller');

const { authUser } = require('../middleware/authUser');

router.post('/api/create-message', authUser, controllerMessage.createMessage);
router.get('/api/messages', authUser, controllerMessage.getMessages);
router.get('/api/message', authUser, controllerMessage.getMessage);

module.exports = router;
