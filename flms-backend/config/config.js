const path = require('path');
// هنا نجبروه يقرأ ملف .env من المجلد الرئيسي (flms-backend)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// درتلك الأسطر هادي باش نتأكدوا إن البيانات انقرت صح في التيرمينال
console.log("=== Reading Environment Variables ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("===========================");

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
};

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig
};