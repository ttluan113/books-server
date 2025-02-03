const express = require('express');
const router = express.Router();

const controllerDiscount = require('./discount.controller');

router.post('/api/add-discount', controllerDiscount.addDiscount);
router.post('/api/add-user-discount', controllerDiscount.addUserDiscount);
router.get('/api/discount', controllerDiscount.getAllDiscount);
router.delete('/api/delete-discount', controllerDiscount.deleteDiscount);

module.exports = router;
