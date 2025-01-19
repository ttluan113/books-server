const express = require('express');
const router = express.Router();

const controllerDiscount = require('./discount.controller');

router.post('/api/add-discount', controllerDiscount.addDiscount);
router.post('/api/add-user-discount', controllerDiscount.addUserDiscount);

module.exports = router;
