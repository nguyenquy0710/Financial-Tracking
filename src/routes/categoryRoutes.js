const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const { categoryValidation } = require('../middleware/validator');

router.use(auth);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', categoryValidation.create, categoryController.createCategory);
router.put('/:id', categoryValidation.update, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
