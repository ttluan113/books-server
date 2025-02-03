const express = require('express');
const router = express.Router();

const controllerCart = require('./cart.controller');
router.post('/api/add-cart', controllerCart.addCart);
router.get('/api/cart', controllerCart.getCart);
router.delete('/api/delete-product', controllerCart.deleteProductCart);
router.delete('/api/delete-cart', controllerCart.deleteCart);

module.exports = router;
