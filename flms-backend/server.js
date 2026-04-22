const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const db = require('./models');
const { initNFC } = require('./services/nfcService');
const { initZK } = require('./services/zkService');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const auditMiddleware = require('./middleware/auditMiddleware');
app.use(auditMiddleware);

const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const smartCardRoutes = require('./routes/smartCardRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const auditRoutes = require('./routes/auditRoutes');
const biometricRoutes = require('./routes/biometricRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/smart-cards', smartCardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/biometric', biometricRoutes);

app.get('/', (req, res) => {
    res.send('Welcome! FLMS System Server is running successfully with Sequelize and NFC Support.');
});

// Initialize Biometric (ZK) Service with Integrated NFC (ZK8500R)
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize ZK Service (handles both Biometrics and NFC for ZK8500R)
initZK(io);

// Standalone NFC is disabled as requested to avoid conflicts with ZK bridge
// const io_nfc = initNFC(server);

const PORT = process.env.PORT || 3000;

// Sync database and start server
async function startServer() {
  try {
    await db.sequelize.sync({ alter: true });
    console.log(' Database synchronized successfully.');

    server.listen(PORT, () => {
      console.log(` Server is running successfully on: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Failed to synchronize database or start server:', error);
  }
}

startServer();
