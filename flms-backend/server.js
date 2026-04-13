const express = require('express');
const cors = require('cors');
require('dotenv').config(); // باش يقرا ملف .env

const app = express();

// إعدادات أساسية لعمل السيرفر
app.use(cors()); // للسماح للواجهة الأمامية بالتواصل مع السيرفر
app.use(express.json()); // لكي يفهم السيرفر البيانات المرسلة

// --------------------------------------------------------
// استدعاء روابط الـ API (المسارات اللي درناها في الخطوات السابقة)
// --------------------------------------------------------
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const smartCardRoutes = require('./routes/smartCardRoutes');

app.use('/api/auth', authRoutes); // هكي الرابط حيكون /api/auth/login زي ما تبي الواجهة
app.use('/api/workers', workerRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/smart-cards', smartCardRoutes);

// مسار فحص عمل السيرفر
app.get('/', (req, res) => {
    res.send('Welcome! FLMS System Server is running successfully with Sequelize.');
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Server is running successfully on: http://localhost:${PORT}`);
});