const express = require('express');
const router = express.Router();

const { authAdmin } = require('../middleware/authUser');

const controllerCategory = require('./category.controller');

router.post('/api/add-category', authAdmin, controllerCategory.createCategory);
router.get('/api/category', controllerCategory.getCategory);
router.delete('/api/delete-category', authAdmin, controllerCategory.deleteCategory);

router.post('/api/edit-category', authAdmin, controllerCategory.updateCategory);

module.exports = router;
