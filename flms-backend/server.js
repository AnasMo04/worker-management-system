const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); // باش يقرا ملف .env

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST"]
    }
});

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
const smartCardRoutes = require('./routes/smartCardRoutes');

app.use('/api/auth', authRoutes); // هكي الرابط حيكون /api/auth/login زي ما تبي الواجهة
app.use('/api/workers', workerRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/smart-cards', smartCardRoutes);

// NFC Service Integration
const nfcService = require('./services/nfcService');
nfcService.init(io);

io.on('connection', (socket) => {
    console.log('A client connected to WebSocket');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

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

        server.listen(PORT, () => {
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