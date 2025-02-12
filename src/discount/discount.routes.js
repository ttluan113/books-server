const express = require('express');
const router = express.Router();

const controllerDiscount = require('./discount.controller');

const { authUser, authAdmin } = require('../middleware/authUser');

router.post('/api/add-discount', authAdmin, controllerDiscount.addDiscount);
router.post('/api/add-user-discount', authUser, controllerDiscount.addUserDiscount);
router.get('/api/discount', authUser, controllerDiscount.getAllDiscount);
router.delete('/api/delete-discount', authUser, controllerDiscount.deleteDiscount);

module.exports = router;
