const mysql = require('mysql2');

// Connect directly to your database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thanks',
    database: 'acounting'
});

console.log("Attempting to create the customers table...");

const sql = `
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

connection.query(sql, (err, results) => {
    if (err) {
        console.error("ERROR:", err.message);
    } else {
        console.log("SUCCESS: The customers table is ready!");
    }
    connection.end();
});