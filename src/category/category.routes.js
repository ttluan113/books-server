const express = require('express');
const router = express.Router();

const controllerCategory = require('./category.controller');

router.post('/api/add-category', controllerCategory.createCategory);
router.get('/api/category', controllerCategory.getCategory);

module.exports = router;
