const express = require('express');
const router = express.Router();

const { authAdmin } = require('../middleware/authUser');

const controllerStatistical = require('./statistical.controller');

router.get('/api/statistical', authAdmin, controllerStatistical.getStatistical);

module.exports = router;
