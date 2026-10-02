const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks',
    database: 'acounting'
});

console.log("Deleting old invoices table so we can rebuild it...");

connection.query('DROP TABLE IF EXISTS invoices', (err, results) => {
    if (err) {
        console.error("Error dropping table:", err.message);
    } else {
        console.log("SUCCESS: Old invoices table deleted!");
    }
    connection.end();
});