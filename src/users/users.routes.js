const express = require('express');
const router = express.Router();
const controllerUser = require('./users.controller');
const multer = require('multer');
const path = require('path');

const authUser = require('../middleware/authUser');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/avatars');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

router.post('/api/register', controllerUser.register);
router.get('/api/auth', authUser, controllerUser.auth);
router.get('/api/logout', controllerUser.logOut);
router.post('/api/login', controllerUser.login);
router.get('/api/search-address', controllerUser.searchAddress);
router.post('/api/edit-user', authUser, upload.single('avatar'), controllerUser.editUser);
router.get('/api/refresh-token', controllerUser.refreshToken);

router.get('/api/get-all-user', controllerUser.getAllUser);
router.post('/api/create-address', controllerUser.createAddress);
router.delete('/api/delete-address', controllerUser.deleteAddress);

router.post('/api/heart-product', controllerUser.heartProduct);
router.get('/api/get-heart-product', controllerUser.getHeartProduct);

router.get('/api/get-heart-product-user', controllerUser.getHeartProductUser);

module.exports = router;
