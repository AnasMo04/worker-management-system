// Note: nfc-pcsc requires native build which may fail in some environments
// This service provides the logic to listen for card taps and emit UIDs via Socket.io

let nfc;
try {
  const { NFC } = require('nfc-pcsc');
  nfc = new NFC();
} catch (err) {
  console.warn('nfc-pcsc not installed or native build failed. NFC hardware support disabled.');
}

exports.init = (io) => {
  if (!nfc) return;

  console.log('NFC Service initialized, listening for readers...');

  nfc.on('reader', (reader) => {
    console.log(`${reader.reader.name} device attached`);

    reader.on('card', (card) => {
      // card.uid is the serial number
      console.log(`Card detected: UID ${card.uid}`);

      // Push UID to all connected clients (specifically the SmartCards page)
      io.emit('nfc:card-tapped', { uid: card.uid });
    });

    reader.on('error', (err) => {
      console.error(`${reader.reader.name} an error occurred`, err);
    });

    reader.on('end', () => {
      console.log(`${reader.reader.name} device removed`);
    });
  });

  nfc.on('error', (err) => {
    console.error('NFC error occurred', err);
  });
};
