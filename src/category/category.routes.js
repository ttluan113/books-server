const express = require('express');
const router = express.Router();

const controllerCategory = require('./category.controller');

router.post('/api/add-category', controllerCategory.createCategory);
router.get('/api/category', controllerCategory.getCategory);
router.delete('/api/delete-category', controllerCategory.deleteCategory);

router.post('/api/edit-category', controllerCategory.updateCategory);

module.exports = router;
