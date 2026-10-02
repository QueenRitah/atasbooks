const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getCreditNotes, createCreditNote } = require('../controllers/creditNoteController');

const router = express.Router();

router.route('/')
    .get(protect, getCreditNotes)
    .post(protect, createCreditNote);

module.exports = router;