const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getExpenses, createExpense } = require('../controllers/expenseController');

const router = express.Router();

router.route('/')
    .get(protect, getExpenses)
    .post(protect, createExpense);

module.exports = router;