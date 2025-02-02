const express = require('express');
const router = express.Router();

const controllerNotify = require('./notify.controller');

router.post('/api/add-notify', controllerNotify.postNotify);
router.get('/api/notify', controllerNotify.getNotify);
router.post('/api/read-notify', controllerNotify.readNotify);

module.exports = router;
