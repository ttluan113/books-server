const express = require('express');
const router = express.Router();

const controllerNotify = require('./notify.controller');

const { authUser } = require('../middleware/authUser');

router.post('/api/add-notify', authUser, controllerNotify.postNotify);
router.get('/api/notify', authUser, controllerNotify.getNotify);
router.post('/api/read-notify', authUser, controllerNotify.readNotify);

module.exports = router;
