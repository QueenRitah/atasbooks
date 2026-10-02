const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks',
    database: 'acounting'
});

console.log("Adding description column to invoices...");

connection.query('ALTER TABLE invoices ADD COLUMN description TEXT', (err, results) => {
    if (err) {
        // If it says "Duplicate column name", that means it's already there! Which is fine.
        console.log("Column might already exist:", err.message);
    } else {
        console.log("SUCCESS: Description column added!");
    }
    connection.end();
});