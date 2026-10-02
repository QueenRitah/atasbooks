const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks',
    database: 'acounting'
});

const sql = 'ALTER TABLE users ADD COLUMN profilePic LONGTEXT';

connection.query(sql, (err, results) => {
    if (err) {
        // If it says "Duplicate column name", that means it's already there! Which is fine.
        if (err.errno === 1060) {
            console.log("SUCCESS: profilePic column already exists!");
        } else {
            console.error("ERROR:", err.message);
        }
    } else {
        console.log("SUCCESS: profilePic column added!");
    }
    connection.end();
});