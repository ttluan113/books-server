const express = require('express');
const router = express.Router();

const controllerDiscountProduct = require('./discountProduct.controller');

router.post('/api/create-discount-product', controllerDiscountProduct.createDiscountProduct);
router.get('/api/get-discount-product', controllerDiscountProduct.getDiscountProduct);

module.exports = router;
