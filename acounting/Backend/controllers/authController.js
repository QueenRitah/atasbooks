const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register a new user
const registerUser = async (req, res) => {
    const { name, email, password, accessCode } = req.body;

    const secretCode = 'ATAS-PRO-2026';
    if (accessCode !== secretCode) {
        return res.status(403).json({ message: "Invalid Access Code. Please pay to get your access code." });
    }

    try {
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "User already exists with this email" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            'my_super_secret_accounting_app_key_2024',
            { expiresIn: '30d' }
        );
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                company_name: user.company_name,
                company_address: user.company_address,
                company_email: user.company_email,
                company_logo: user.company_logo,
                country: user.country,
                vat_rate: user.vat_rate
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    const { name, email, company_name, company_address, company_email, company_logo, country, vat_rate } = req.body;
    try {
        if (company_logo) {
            await db.query(`
                UPDATE users 
                SET name = ?, email = ?, company_name = ?, company_address = ?, company_email = ?, company_logo = ?, country = ?, vat_rate = ? 
                WHERE id = ?
            `, [name, email, company_name, company_address, company_email, company_logo, country, vat_rate, req.user.id]);
        } else {
            await db.query(`
                UPDATE users 
                SET name = ?, email = ?, company_name = ?, company_address = ?, company_email = ?, country = ?, vat_rate = ? 
                WHERE id = ?
            `, [name, email, company_name, company_address, company_email, country, vat_rate, req.user.id]);
        }
        res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "SECRET ERROR: " + error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile };