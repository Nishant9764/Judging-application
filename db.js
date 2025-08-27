const mysql = require('mysql2');

// create connection pool
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // 👈 Our MySQL username
    password: 'Naik@123',       // 👈 Our MySQL password
    database: 'auth_db' // 👈 the database we created
});

db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Database connected');
});

module.exports = db;


