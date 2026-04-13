const { spawn } = require('child_process');
const path = require('path');

/**
 * NFC Service: Bridges the ACS hardware reader to the UI via a Python script.
 * We use a Python bridge (pyscard) because it avoids native build issues with Node.js nfc-pcsc.
 */
exports.init = (io) => {
  console.log('NFC Service: Initializing Python bridge...');

  const pythonScript = path.join(__dirname, '../nfc_reader.py');

  // Use absolute path for Windows environment as requested
  const pythonExe = 'C:\\Python314\\python.exe';
  const nfcProcess = spawn(pythonExe, [pythonScript]);

  nfcProcess.on('error', (err) => {
    console.error(`[NFC Python Bridge] CRITICAL ERROR: Failed to start process at ${pythonExe}.`, err.message);
    console.warn('NFC hardware support will be disabled. Ensure Python is installed at the specified path.');
  });

  nfcProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[NFC Python Bridge]: ${output}`);

    // Look for the UID signature: "UID:ABCDEF1234"
    if (output.includes('UID:')) {
      const uid = output.split('UID:')[1].trim();
      console.log(`[NFC] Pushing UID to clients: ${uid}`);
      io.emit('nfc:card-tapped', { uid });
    }
  });

  nfcProcess.stderr.on('data', (data) => {
    console.error(`[NFC Python Error]: ${data}`);
  });

  nfcProcess.on('close', (code) => {
    console.log(`[NFC Python Bridge] Process exited with code ${code}`);
  });

  process.on('exit', () => {
    nfcProcess.kill();
  });
};
