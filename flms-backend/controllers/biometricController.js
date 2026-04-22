const { sendCommand } = require('../services/zkService');

exports.enroll = async (req, res) => {
    const { fingerIndex } = req.body;

    console.log(`[Biometric Controller] Requested enrollment for Finger Index: ${fingerIndex}`);

    // We can send a command to the persistent Python process to set the current finger index
    const success = sendCommand('set_finger', { index: fingerIndex || 0 });

    if (success) {
        res.json({
            success: true,
            message: 'Biometric bridge is ready. Please place your finger on the sensor.'
        });
    } else {
        res.status(503).json({
            success: false,
            message: 'Biometric service is not responding or starting up. Please try again in a few seconds.'
        });
    }
};

exports.getStatus = async (req, res) => {
    // Basic status check
    res.json({ success: true, service: 'ZK Biometric Bridge', architecture: '32-bit' });
};
