const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const productRoutes = require('./routes/productRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const creditNoteRoutes = require('./routes/creditNoteRoutes');

// Initialize the app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// --- AUTO-CREATE DATABASE TABLES ON STARTUP ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks',
    database: 'acounting'
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Connected to MySQL database.");

    // --- FORCE ADD MISSING COLUMNS (AUTO-FIX) ---
    db.query(`ALTER TABLE users ADD COLUMN country VARCHAR(255)`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Users.country column already exists"); else console.error(err.message); }
        else console.log("SUCCESS: users.country column added!");
    });
    db.query(`ALTER TABLE users ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 16.00`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Users.vat_rate column already exists"); else console.error(err.message); }
        else console.log("SUCCESS: users.vat_rate column added!");
    });
    db.query(`ALTER TABLE users ADD COLUMN company_name VARCHAR(255)`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Users.company_name already exists"); else console.error(err.message); }
    });
    db.query(`ALTER TABLE users ADD COLUMN company_address VARCHAR(255)`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Users.company_address already exists"); else console.error(err.message); }
    });
    db.query(`ALTER TABLE users ADD COLUMN company_email VARCHAR(255)`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Users.company_email already exists"); else console.error(err.message); }
    });
    db.query(`ALTER TABLE users ADD COLUMN company_logo LONGTEXT`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Users.company_logo already exists"); else console.error(err.message); }
    });
    db.query(`ALTER TABLE invoices ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 16.00`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Invoices.vat_rate already exists"); else console.error(err.message); }
        else console.log("SUCCESS: invoices.vat_rate column added!");
    });
    db.query(`ALTER TABLE invoices ADD COLUMN description TEXT`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Invoices.description already exists"); else console.error(err.message); }
    });
    db.query(`ALTER TABLE invoices ADD COLUMN vat_applied BOOLEAN DEFAULT TRUE`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Invoices.vat_applied already exists"); else console.error(err.message); }
    });
    db.query(`ALTER TABLE expenses ADD COLUMN receipt_image LONGTEXT`, (err) => {
        if (err) { if (err.errno === 1060) console.log("Expenses.receipt_image already exists"); else console.error(err.message); }
    });

    // --- CREATE TABLES IF THEY DON'T EXIST ---
    db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => { if (err) console.error(err.message); else console.log("Users table is ready!"); });

    db.query(`
        CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            company VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => { if (err) console.error(err.message); else console.log("Customers table is ready!"); });

    db.query(`
        CREATE TABLE IF NOT EXISTS invoices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            customer_id INT NOT NULL,
            invoice_number VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'Unpaid',
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => { if (err) console.error(err.message); else console.log("Invoices table is ready!"); });

    db.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            category VARCHAR(255) NOT NULL,
            description TEXT,
            amount DECIMAL(10,2) NOT NULL,
            date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => { if (err) console.error(err.message); else console.log("Expenses table is ready!"); });

    db.query(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            stock INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => { if (err) console.error(err.message); else console.log("Inventory table is ready!"); });

    db.query(`
        CREATE TABLE IF NOT EXISTS vendors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            company VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => { if (err) console.error(err.message); else console.log("Vendors table is ready!"); });

    db.query(`
        CREATE TABLE IF NOT EXISTS credit_notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            customer_id INT NOT NULL,
            cn_number VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            reason TEXT,
            date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => { if (err) console.error(err.message); else console.log("Credit Notes table is ready!"); });
});
// ------------------------------------------------

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/inventory', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/credit-notes', creditNoteRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Atas Books API!" });
});

// Set the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});