const express = require('express');
const router = express.Router();

const controllerProducts = require('./products.controller');

const { authAdmin } = require('../middleware/authUser');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/products');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

router.post('/api/add-product', authAdmin, upload.array('images'), controllerProducts.addProduct);
router.get('/api/get-products', controllerProducts.getProducts);
router.get('/api/get-product', controllerProducts.getProduct);
router.get('/api/product-top-buy', controllerProducts.getProductsTopBuy);
router.delete('/api/delete-product', authAdmin, controllerProducts.deleteProduct);
router.put('/api/edit-product', authAdmin, upload.array('images'), controllerProducts.editProduct);

router.get('/api/product-flash-sale', controllerProducts.getProductFlashSale);

module.exports = router;
