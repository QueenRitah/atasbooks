const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getProducts, createProduct } = require('../controllers/productController');

const router = express.Router();

router.route('/')
    .get(protect, getProducts)
    .post(protect, createProduct);

module.exports = router;