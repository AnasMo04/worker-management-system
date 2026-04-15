const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const db = require('./models');
const { initNFC } = require('./services/nfcService');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const smartCardRoutes = require('./routes/smartCardRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/smart-cards', smartCardRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.send('Welcome! FLMS System Server is running successfully with Sequelize and NFC Support.');
});

// Initialize NFC Service with Socket.io
initNFC(server);

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
