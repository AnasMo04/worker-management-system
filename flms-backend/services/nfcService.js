const { spawn } = require('child_process');
const path = require('path');
const { Server } = require('socket.io');
const { Worker } = require('../models');

let io;
let nfcProcess;

const initNFC = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to NFC WebSocket');
  });

  startNFCReader();
  return io;
};

const startNFCReader = () => {
  // Use absolute path as requested for the Windows environment
  const pythonPath = 'C:\\Python314\\python.exe';
  const scriptPath = path.join(__dirname, '..', 'nfc_reader.py');

  console.log(`Starting NFC Reader with: ${pythonPath} ${scriptPath}`);

  try {
    nfcProcess = spawn(pythonPath, [scriptPath]);

    nfcProcess.stdout.on('data', async (data) => {
      const output = data.toString().trim();

      // Handle multiple lines if they arrive together
      const lines = output.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('UID:')) {
          const uid = line.replace('UID:', '').trim();
          console.log(`NFC Card Tapped: ${uid}`);

          if (io) {
            // 1. Emit generic tap event
            io.emit('nfc:card-tapped', { uid });

            // 2. Automated Worker Identification
            try {
              const worker = await Worker.findOne({
                where: { NFC_UID: uid },
                attributes: ['id', 'Full_Name', 'Current_Status', 'Passport_Number']
              });

              if (worker) {
                console.log(`Worker Identified: ${worker.Full_Name} (ID: ${worker.id})`);
                // Emit event that the frontend uses to reaction
                io.emit('card-scanned', {
                  id: worker.id,
                  name: worker.Full_Name,
                  status: worker.Current_Status,
                  passport: worker.Passport_Number,
                  uid: uid
                });
              } else {
                console.log(`No worker found for UID: ${uid}`);
                io.emit('nfc:unknown-card', { uid });
              }
            } catch (dbErr) {
              console.error(`Database error during NFC identification: ${dbErr.message}`);
            }
          }
        }
      }
    });

    nfcProcess.stderr.on('data', (data) => {
      console.error(`NFC Reader Error: ${data}`);
    });

    nfcProcess.on('error', (err) => {
      console.error(`Failed to start NFC process: ${err.message}`);
    });

    nfcProcess.on('close', (code) => {
      console.log(`NFC Reader process exited with code ${code}. Restarting in 5s...`);
      setTimeout(startNFCReader, 5000);
    });
  } catch (err) {
    console.error(`Exception while starting NFC process: ${err.message}`);
    setTimeout(startNFCReader, 5000);
  }
};

module.exports = { initNFC };
