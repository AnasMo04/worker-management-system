const usb = require('usb');

function listDevices() {
    console.log('--- Connected USB Devices ---');
    const devices = usb.getDeviceList();

    devices.forEach((device, index) => {
        const desc = device.deviceDescriptor;
        const vid = desc.idVendor.toString(16).padStart(4, '0').toUpperCase();
        const pid = desc.idProduct.toString(16).padStart(4, '0').toUpperCase();

        console.log(`${index + 1}. VID: 0x${vid}, PID: 0x${pid}`);

        // ZKTeco VIDs are usually 1B55 or 1F6B
        if (vid === '1B55' || vid === '1F6B') {
            console.log('   >>> POSSIBLE ZKTECO DEVICE DETECTED <<<');
        }

        // ACS VID for ACR122
        if (vid === '072F') {
            console.log('   >>> ACR122 (NFC) DETECTED <<<');
        }
    });

    if (devices.length === 0) {
        console.log('No USB devices found. (Note: Sandbox environment cannot access local USB hardware)');
    }
    console.log('------------------------------');
    console.log('\n--- Troubleshooting Instructions ---');
    console.log('1. Run this script LOCALLY on your Windows machine.');
    console.log('2. If VID 1B55 or 1F6B is found but it is "Unknown", follow these steps:');
    console.log('   a. Open Device Manager (devmgmt.msc).');
    console.log('   b. Right-click the problematic device -> Update Driver.');
    console.log('   c. Select "Browse my computer for drivers".');
    console.log('   d. Select "Let me pick from a list of available drivers".');
    console.log('   e. Click "Have Disk..." and browse to:');
    console.log('      C:\\Program Files\\ZKTeco\\FreeFinger\\driver (or equivalent)');
    console.log('   f. Select the .inf file and force install.');
}

listDevices();
