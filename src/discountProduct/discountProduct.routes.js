const express = require('express');
const router = express.Router();

const controllerDiscountProduct = require('./discountProduct.controller');

const { authAdmin } = require('../middleware/authUser');

router.post('/api/create-discount-product', authAdmin, controllerDiscountProduct.createDiscountProduct);
router.get('/api/get-discount-product', controllerDiscountProduct.getDiscountProduct);
router.delete('/api/delete-discount-product', authAdmin, controllerDiscountProduct.deleteDiscountProduct);

module.exports = router;
