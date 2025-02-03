const express = require('express');
const router = express.Router();

const controllerProducts = require('./products.controller');

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

router.post('/api/add-product', upload.array('images'), controllerProducts.addProduct);
router.get('/api/get-products', controllerProducts.getProducts);
router.get('/api/get-product', controllerProducts.getProduct);

router.delete('/api/delete-product', controllerProducts.deleteProduct);

router.post('/api/edit-product', upload.array('images'), controllerProducts.editProduct);

module.exports = router;
