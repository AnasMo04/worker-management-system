const { SmartCard, Worker, sequelize } = require('./models');

async function purgeDummyCards() {
  try {
    console.log('Starting dummy card purge...');

    // Find all cards where NFC_Chip_ID is null, empty, or '1234567890' (the mock value I used)
    const deletedCount = await SmartCard.destroy({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { NFC_Chip_ID: null },
          { NFC_Chip_ID: '' },
          { NFC_Chip_ID: '1234567890' }
        ]
      }
    });

    // Also clear NFC_UID and Primary_Card_Serial from Workers for these cards
    // This is a bit tricky with just destroy, so maybe update first
    await Worker.update(
      { NFC_UID: null, Primary_Card_Serial: null },
      {
        where: {
          [sequelize.Sequelize.Op.or]: [
            { NFC_UID: null },
            { NFC_UID: '' },
            { NFC_UID: '1234567890' }
          ]
        }
      }
    );

    console.log(`Successfully purged ${deletedCount} dummy card records.`);
  } catch (error) {
    console.error('Error during purge:', error);
  } finally {
    process.exit();
  }
}

purgeDummyCards();
