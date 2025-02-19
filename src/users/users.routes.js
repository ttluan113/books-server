const express = require('express');
const router = express.Router();
const controllerUser = require('./users.controller');
const multer = require('multer');
const path = require('path');

const { authUser, authAdmin } = require('../middleware/authUser');

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
router.get('/api/logout', authUser, controllerUser.logOut);
router.post('/api/login', controllerUser.login);
router.get('/api/search-address', authUser, controllerUser.searchAddress);
router.post('/api/edit-user', authUser, upload.single('avatar'), controllerUser.editUser);
router.get('/api/refresh-token', controllerUser.refreshToken);

router.get('/api/get-all-user', authAdmin, controllerUser.getAllUser);
router.post('/api/create-address', authUser, controllerUser.createAddress);
router.delete('/api/delete-address', authUser, controllerUser.deleteAddress);
router.post('/api/heart-product', authUser, controllerUser.heartProduct);
router.get('/api/get-heart-product', authUser, controllerUser.getHeartProduct);
router.get('/api/get-heart-product-user', authUser, controllerUser.getHeartProductUser);
router.post('/api/forgot-password', controllerUser.forgotPassword);
router.post('/api/reset-password', controllerUser.resetPassword);

router.post('/api/login-google', controllerUser.loginGoogle);
router.post('/api/verify-account', controllerUser.verifyAccount);

module.exports = router;
