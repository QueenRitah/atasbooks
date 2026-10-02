const db = require('../config/db');

// Get all expenses
const getExpenses = async (req, res) => {
    try {
        const [expenses] = await db.query('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', [req.user.id]);
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Create a new expense (Now with receipt_image!)
const createExpense = async (req, res) => {
    const { category, description, amount, date, receipt_image } = req.body;
    
    if (!category || !amount) {
        return res.status(400).json({ message: "Category and Amount are required" });
    }

    try {
        await db.query('INSERT INTO expenses (user_id, category, description, amount, date, receipt_image) VALUES (?, ?, ?, ?, ?, ?)', 
            [req.user.id, category, description, amount, date, receipt_image || null]);
        res.status(201).json({ message: "Expense recorded successfully!" });
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

module.exports = { getExpenses, createExpense };