const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks',
    database: 'acounting'
});

console.log("Adding vat_applied column to invoices...");

connection.query('ALTER TABLE invoices ADD COLUMN vat_applied BOOLEAN DEFAULT TRUE', (err, results) => {
    if (err) {
        // If it says "Duplicate column name", that means it's already there!
        if (err.errno === 1060) {
            console.log("SUCCESS: vat_applied column already exists!");
        } else {
            console.error("ERROR:", err.message);
        }
    } else {
        console.log("SUCCESS: vat_applied column added!");
    }
    connection.end();
});