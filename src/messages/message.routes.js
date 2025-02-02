const express = require('express');
const router = express.Router();

const controllerMessage = require('./message.controller');

router.post('/api/create-message', controllerMessage.createMessage);
router.get('/api/messages', controllerMessage.getMessage);

module.exports = router;
