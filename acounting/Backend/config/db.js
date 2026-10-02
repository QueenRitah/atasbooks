const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Thanks', 
    database: 'acounting'  // MUST be exactly this
});

module.exports = pool.promise();