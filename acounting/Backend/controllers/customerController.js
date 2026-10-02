const db = require('../config/db');

// Get all customers for the logged-in user
const getCustomers = async (req, res) => {
    try {
        const [customers] = await db.query('SELECT * FROM customers WHERE user_id = ?', [req.user.id]);
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Add a new customer
const createCustomer = async (req, res) => {
    const { name, email, phone, company } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: "Customer name is required" });
    }

    try {
        await db.query('INSERT INTO customers (user_id, name, email, phone, company) VALUES (?, ?, ?, ?, ?)', 
            [req.user.id, name, email, phone, company]);
        res.status(201).json({ message: "Customer added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Delete a customer (NEW)
const deleteCustomer = async (req, res) => {
    try {
        await db.query('DELETE FROM customers WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.status(200).json({ message: "Customer deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

module.exports = { getCustomers, createCustomer, deleteCustomer };