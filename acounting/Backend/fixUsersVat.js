const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks',
    database: 'acounting'
});

console.log("Adding Country and VAT columns to users...");

connection.query('ALTER TABLE users ADD COLUMN country VARCHAR(255)', (err) => {
    if (err) { if (err.errno === 1060) console.log("country column already exists"); else console.error(err.message); }
    else console.log("SUCCESS: country column added!");
});

connection.query('ALTER TABLE users ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 16.00', (err) => {
    if (err) { if (err.errno === 1060) console.log("vat_rate column already exists"); else console.error(err.message); }
    else console.log("SUCCESS: vat_rate column added!");
});

// We also need to save the VAT rate on the invoice itself so old invoices don't change if the country changes later
connection.query('ALTER TABLE invoices ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 16.00', (err) => {
    if (err) { if (err.errno === 1060) console.log("invoices vat_rate column already exists"); else console.error(err.message); }
    else console.log("SUCCESS: invoices vat_rate column added!");
    connection.end();
});