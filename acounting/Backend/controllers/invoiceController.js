const db = require('../config/db');

// Get all invoices
const getInvoices = async (req, res) => {
    try {
        const [invoices] = await db.query(`
            SELECT invoices.*, customers.name AS customer_name 
            FROM invoices 
            JOIN customers ON invoices.customer_id = customers.id 
            WHERE invoices.user_id = ?
        `, [req.user.id]);
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Create a new invoice
const createInvoice = async (req, res) => {
    const { customer_id, invoice_number, description, amount, status, due_date, vat_applied, vat_rate } = req.body;
    
    if (!customer_id || !invoice_number || !amount) {
        return res.status(400).json({ message: "Customer, Invoice #, and Amount are required" });
    }

    try {
        await db.query('INSERT INTO invoices (user_id, customer_id, invoice_number, description, amount, status, due_date, vat_applied, vat_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [req.user.id, customer_id, invoice_number, description, amount, status || 'Unpaid', due_date, vat_applied ? 1 : 0, vat_rate || 16]);
        res.status(201).json({ message: "Invoice created successfully!" });
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Update invoice status
const updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query('UPDATE invoices SET status = ? WHERE id = ? AND user_id = ?', [status, id, req.user.id]);
        res.status(200).json({ message: "Invoice status updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

module.exports = { getInvoices, createInvoice, updateInvoiceStatus };