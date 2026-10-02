const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks',
    database: 'acounting'
});

console.log("Adding receipt_image column to expenses...");

connection.query('ALTER TABLE expenses ADD COLUMN receipt_image LONGTEXT', (err, results) => {
    if (err) {
        if (err.errno === 1060) {
            console.log("SUCCESS: receipt_image column already exists!");
        } else {
            console.error("ERROR:", err.message);
        }
    } else {
        console.log("SUCCESS: receipt_image column added!");
    }
    connection.end();
});