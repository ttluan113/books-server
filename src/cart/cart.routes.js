const express = require('express');
const router = express.Router();

const authUser = require('../middleware/authUser');

const controllerCart = require('./cart.controller');
router.post('/api/add-cart', authUser, controllerCart.addCart);
router.get('/api/cart', controllerCart.getCart);
router.delete('/api/delete-product-cart', controllerCart.deleteProductCart);
router.delete('/api/delete-cart', controllerCart.deleteCart);

module.exports = router;
