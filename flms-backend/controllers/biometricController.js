const { sendCommand } = require('../services/zkService');

exports.enroll = async (req, res) => {
    const { fingerIndex } = req.body;

    console.log(`[Biometric Controller] Requested enrollment for Finger Index: ${fingerIndex}`);

    // Set mode to enroll and set finger index
    sendCommand('set_mode', { mode: 'enroll' });
    const success = sendCommand('set_finger', { index: fingerIndex || 0 });

    if (success) {
        res.json({
            success: true,
            message: 'Biometric bridge is ready for ENROLLMENT. Please place your finger on the sensor.'
        });
    } else {
        res.status(503).json({
            success: false,
            message: 'Biometric service is not responding or starting up. Please try again in a few seconds.'
        });
    }
};

exports.identify = async (req, res) => {
    const { templates } = req.body; // Array of { id, template }

    console.log(`[Biometric Controller] Requested IDENTIFICATION with ${templates?.length || 0} templates.`);

    // 1. Load templates into bridge
    sendCommand('load_templates', { templates: templates || [] });

    // 2. Set mode to identify
    const success = sendCommand('set_mode', { mode: 'identify' });

    if (success) {
        res.json({
            success: true,
            message: 'Biometric bridge is ready for IDENTIFICATION. Please place your finger on the sensor.'
        });
    } else {
        res.status(503).json({
            success: false,
            message: 'Biometric service is not responding.'
        });
    }
};

exports.getStatus = async (req, res) => {
    // Basic status check
    res.json({ success: true, service: 'ZK Biometric Bridge', architecture: '32-bit' });
};
