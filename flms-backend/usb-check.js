const usb = require('usb');

/**
 * flms-backend/usb-check.js
 *
 * This script logs all connected USB devices with their Vendor ID (VID) and Product ID (PID).
 * It is used for diagnostics to verify the presence of ZKTeco and ACR122 hardware.
 */

function checkUsbDevices() {
    console.log('--- Scanning USB Devices ---');
    const devices = usb.getDeviceList();

    if (devices.length === 0) {
        console.log('No USB devices found.');
        console.log('Note: If running in a virtual environment or sandbox, hardware access may be restricted.');
    } else {
        devices.forEach((device, index) => {
            const desc = device.deviceDescriptor;
            const vid = desc.idVendor.toString(16).padStart(4, '0').toUpperCase();
            const pid = desc.idProduct.toString(16).padStart(4, '0').toUpperCase();

            console.log(`${index + 1}. VID: 0x${vid}, PID: 0x${pid}`);

            // Helpful hints for known devices
            if (vid === '072F') {
                console.log('   [Detected: ACS / ACR122 NFC Reader]');
            } else if (vid === '1B55' || vid === '1F6B') {
                console.log('   [Detected: Possible ZKTeco / Fingerprint Sensor]');
            }
        });
    }

    console.log('---------------------------');
    console.log('\nInstructions:');
    console.log('To run this locally, ensure you have libusb-1.0-0-dev installed (on Linux) or appropriate drivers.');
    console.log('Command: node flms-backend/usb-check.js');
}

checkUsbDevices();
