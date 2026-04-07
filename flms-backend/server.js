const express = require('express');
const cors = require('cors');
require('dotenv').config(); // باش يقرا ملف .env

const app = express();

// إعدادات أساسية لعمل السيرفر
app.use(cors()); // للسماح للواجهة الأمامية بالتواصل مع السيرفر
app.use(express.json()); // لكي يفهم السيرفر البيانات المرسلة

const db = require('./models');

// --------------------------------------------------------
// استدعاء روابط الـ API (المسارات اللي درناها في الخطوات السابقة)
// --------------------------------------------------------
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');

app.use('/api/auth', authRoutes); // هكي الرابط حيكون /api/auth/login زي ما تبي الواجهة
app.use('/api/workers', workerRoutes);
app.use('/api/sponsors', sponsorRoutes);

// مسار فحص عمل السيرفر
app.get('/', (req, res) => {
    res.send('Welcome! FLMS System Server is running successfully with Sequelize.');
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // ⚠️ تحديث قاعدة البيانات لتتزامن مع النماذج الجديدة (AWS RDS) قبل بدء استقبال الطلبات
        await db.sequelize.sync({ alter: true });
        console.log('✅ Database schema updated (alter: true) successfully.');

        app.listen(PORT, () => {
            console.log(` Server is running successfully on: http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Error starting server or updating database schema:', err.message);
        // still start the server even if sync fails?
        // Better to fail fast if DB is not ready
        process.exit(1);
    }
}

startServer();