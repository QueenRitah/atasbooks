const mysql = require('mysql2');

// Step 1: Connect to MySQL without a database to create it
const conn1 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks'
});

console.log("Step 1: Creating database...");

conn1.query('CREATE DATABASE IF NOT EXISTS acounting', (err) => {
    if (err) { console.error("Error creating database:", err); return; }
    console.log("Database 'acounting' is ready!");
    conn1.end(); // Close the first connection

    // Step 2: Connect DIRECTLY to the acounting database
    const conn2 = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Thanks',
        database: 'acounting'
    });

    console.log("Step 2: Creating tables...");

    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const customersTable = `
        CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            company VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `;

    conn2.query(usersTable, (err) => {
        if (err) console.error("Users table error:", err);
        else console.log("Table 'users' is ready!");
        
        conn2.query(customersTable, (err) => {
            if (err) console.error("Customers table error:", err);
            else console.log("Table 'customers' is ready!");
            
            console.log("Setup complete! You can stop the script now.");
            conn2.end();
        });
    });
});