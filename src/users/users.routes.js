const express = require('express');
const router = express.Router();

const controllerUser = require('./users.controller');

const multer = require('multer');
const path = require('path');

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
router.get('/api/auth', controllerUser.auth);
router.get('/api/logout', controllerUser.logOut);
router.post('/api/login', controllerUser.login);
router.get('/api/search-address', controllerUser.searchAddress);
router.post('/api/edit-user', upload.single('avatar'), controllerUser.editUser);

module.exports = router;
