const { spawn } = require('child_process');
const path = require('path');

exports.enroll = async (req, res) => {
    // Note: In Windows prod, use PYTHON_PATH from .env or C:\Python314\python.exe
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(__dirname, '..', 'zk_service.py');

    console.log(`Starting Biometric Enrollment (ctypes bridge) with: ${pythonPath} ${scriptPath}`);

    const pyProcess = spawn(pythonPath, [scriptPath]);
    let template = '';
    let errorMsg = '';

    pyProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output.startsWith('TEMPLATE:')) {
            template = output.replace('TEMPLATE:', '').trim();
        }
    });

    pyProcess.stderr.on('data', (data) => {
        errorMsg += data.toString();
    });

    pyProcess.on('close', (code) => {
        if (code === 0 && template) {
            res.json({ success: true, template });
        } else {
            console.error(`Biometric Error: ${errorMsg}`);
            res.status(500).json({ success: false, message: errorMsg || 'فشل في التقاط البصمة' });
        }
    });
};
