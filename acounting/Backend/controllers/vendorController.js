const db = require('../config/db');

// Get all vendors
const getVendors = async (req, res) => {
    try {
        const [vendors] = await db.query('SELECT * FROM vendors WHERE user_id = ?', [req.user.id]);
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Create a new vendor
const createVendor = async (req, res) => {
    const { name, email, phone, company } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: "Vendor name is required" });
    }

    try {
        await db.query('INSERT INTO vendors (user_id, name, email, phone, company) VALUES (?, ?, ?, ?, ?)', 
            [req.user.id, name, email, phone, company]);
        res.status(201).json({ message: "Vendor added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

module.exports = { getVendors, createVendor };