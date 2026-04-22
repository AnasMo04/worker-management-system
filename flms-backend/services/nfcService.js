const { spawn } = require('child_process');
const path = require('path');
const { Server } = require('socket.io');

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

    nfcProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`NFC Reader: ${output}`);

      // Look for UID in the output (format: "UID: 04:A1:B2:C3")
      if (output.startsWith('UID:')) {
        const uid = output.replace('UID:', '').trim();
        if (io) {
          io.emit('nfc:card-tapped', { uid });
          console.log(`Emitted NFC UID: ${uid}`);
        }
      }
    });

    nfcProcess.stderr.on('data', (data) => {
      console.error(`NFC Reader Error: ${data}`);
    });

    nfcProcess.on('error', (err) => {
      console.error(`Failed to start NFC process: ${err.message}`);
      // If C:\Python314\python.exe fails, we might be in a different environment, but following user's instruction.
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
