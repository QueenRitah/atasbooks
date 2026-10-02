const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getCustomers, createCustomer, deleteCustomer } = require('../controllers/customerController');

const router = express.Router();

router.route('/')
    .get(protect, getCustomers)
    .post(protect, createCustomer);

// New route for deleting a specific customer by their ID
router.route('/:id')
    .delete(protect, deleteCustomer);

module.exports = router;