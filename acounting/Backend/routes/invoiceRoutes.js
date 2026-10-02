const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getInvoices, createInvoice, updateInvoiceStatus } = require('../controllers/invoiceController');

const router = express.Router();

router.route('/')
    .get(protect, getInvoices)
    .post(protect, createInvoice);

// New route for updating status
router.route('/:id/status')
    .put(protect, updateInvoiceStatus);

module.exports = router;