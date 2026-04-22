const { spawn } = require('child_process');
const path = require('path');

let io;
let zkProcess;
const PYTHON_32BIT_PATH = 'C:\\Users\\MY-PC\\AppData\\Local\\Programs\\Python\\Python313-32\\python.exe';
const RESTART_DELAY = 3000;

const initZK = (socketIoInstance) => {
    io = socketIoInstance;
    console.log('[ZK Service] Initializing with Socket.io');
    startZKProcess();
};

const startZKProcess = () => {
    const scriptPath = path.join(__dirname, '..', 'zk_service.py');
    console.log(`[ZK Service] Starting 32-bit Biometric Bridge: ${PYTHON_32BIT_PATH}`);

    zkProcess = spawn(PYTHON_32BIT_PATH, [scriptPath], {
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    zkProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            console.log(`[ZK Python] ${trimmedLine}`);

            // Handle Status Updates
            if (trimmedLine.startsWith('[STATUS]') || trimmedLine.startsWith('[WAITING]') || trimmedLine.startsWith('[INFO]')) {
                if (io) io.emit('zk:status', { message: trimmedLine });
            }

            // Handle Errors
            if (trimmedLine.startsWith('[ERROR]')) {
                if (io) io.emit('zk:error', { message: trimmedLine.replace('[ERROR]', '').trim() });
            }

            // Handle Enrollment Data
            // Format expected: ENROLLMENT: {"index": 0, "template": "..."}
            if (trimmedLine.startsWith('ENROLLMENT:')) {
                try {
                    const jsonData = JSON.parse(trimmedLine.replace('ENROLLMENT:', '').trim());
                    if (io) io.emit('zk:enrollment-data', jsonData);
                    console.log(`[ZK Service] Emitted Enrollment Data for index ${jsonData.index}`);
                } catch (e) {
                    console.error('[ZK Service] Failed to parse enrollment data:', e.message);
                }
            }

            // Handle Capture/Image Quality Feedback
            if (trimmedLine.startsWith('[FEEDBACK]')) {
                if (io) io.emit('zk:feedback', { message: trimmedLine.replace('[FEEDBACK]', '').trim() });
            }

            // Handle Live Image Preview
            if (trimmedLine.startsWith('[IMAGE_DATA]')) {
                const imageData = trimmedLine.replace('[IMAGE_DATA]', '').trim();
                if (io) io.emit('zk:image-preview', { image: imageData });
            }

            // Handle Quality Score
            if (trimmedLine.startsWith('[QUALITY]')) {
                const score = parseInt(trimmedLine.replace('[QUALITY]', '').trim());
                if (io) io.emit('zk:quality-score', { score });
            }

        });
    });

    zkProcess.stderr.on('data', (data) => {
        console.error(`[ZK Python Error] ${data}`);
    });

    zkProcess.on('error', (err) => {
        console.error(`[ZK Service] Failed to start process: ${err.message}`);
    });

    zkProcess.on('close', (code) => {
        console.log(`[ZK Service] Process exited with code ${code}. Restarting in ${RESTART_DELAY/1000}s...`);
        setTimeout(startZKProcess, RESTART_DELAY);
    });
};

const sendCommand = (command, payload = {}) => {
    if (zkProcess && zkProcess.stdin.writable) {
        const cmd = JSON.stringify({ command, ...payload }) + '\n';
        zkProcess.stdin.write(cmd);
        return true;
    }
    return false;
};

module.exports = { initZK, sendCommand };
