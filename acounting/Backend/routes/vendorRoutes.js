const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getVendors, createVendor } = require('../controllers/vendorController');

const router = express.Router();

router.route('/')
    .get(protect, getVendors)
    .post(protect, createVendor);

module.exports = router;