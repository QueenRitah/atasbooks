const db = require('../config/db');

// Get all inventory items
const getProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM inventory WHERE user_id = ?', [req.user.id]);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Create a new inventory item
const createProduct = async (req, res) => {
    const { name, description, price, stock } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ message: "Item name and price are required" });
    }

    try {
        await db.query('INSERT INTO inventory (user_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)', 
            [req.user.id, name, description, price, stock || 0]);
        res.status(201).json({ message: "Inventory item added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

module.exports = { getProducts, createProduct };