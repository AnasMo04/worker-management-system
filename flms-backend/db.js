const mysql = require('mysql2/promise');
require('dotenv').config();

// إعداد الاتصال بقاعدة البيانات
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0 
});

// رسالة تأكيد للاتصال بقاعدة البيانات
pool.getConnection()
    .then(connection => {
        console.log(' MySQL Database connected successfully!');
        connection.release();
    })
    .catch(err => {
        console.error(' Database connection error. Please check your MySQL server (AWS/RDS):', err.message);
    });

module.exports = pool;