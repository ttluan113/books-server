const express = require('express');
const router = express.Router();

const controllerUser = require('./users.controller');

router.post('/api/register', controllerUser.register);
router.get('/api/auth', controllerUser.auth);
router.get('/api/logout', controllerUser.logOut);
router.post('/api/login', controllerUser.login);

module.exports = router;
