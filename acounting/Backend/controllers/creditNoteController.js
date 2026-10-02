const db = require('../config/db');

// Get all credit notes
const getCreditNotes = async (req, res) => {
    try {
        const [notes] = await db.query(`
            SELECT credit_notes.*, customers.name AS customer_name 
            FROM credit_notes 
            JOIN customers ON credit_notes.customer_id = customers.id 
            WHERE credit_notes.user_id = ?
        `, [req.user.id]);
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Create a new credit note
const createCreditNote = async (req, res) => {
    const { customer_id, cn_number, amount, reason, date } = req.body;
    
    if (!customer_id || !cn_number || !amount) {
        return res.status(400).json({ message: "Customer, CN #, and Amount are required" });
    }

    try {
        await db.query('INSERT INTO credit_notes (user_id, customer_id, cn_number, amount, reason, date) VALUES (?, ?, ?, ?, ?, ?)', 
            [req.user.id, customer_id, cn_number, amount, reason, date]);
        res.status(201).json({ message: "Credit Note created successfully!" });
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

module.exports = { getCreditNotes, createCreditNote };