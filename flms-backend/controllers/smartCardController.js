const { SmartCard, Worker, sequelize } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const cards = await SmartCard.findAll({
      include: [{ model: Worker, attributes: ['Full_Name'] }]
    });
    res.json(cards);
  } catch (error) {
    console.error('Get All SmartCards Error:', error);
    res.status(500).json({ message: 'Error retrieving smart cards' });
  }
};

exports.checkDuplicate = async (req, res) => {
  try {
    const { nfc_uid } = req.query;
    const existingCard = await SmartCard.findOne({ where: { NFC_Chip_ID: nfc_uid } });
    res.json({ isDuplicate: !!existingCard });
  } catch (error) {
    console.error('Check Duplicate NFC Error:', error);
    res.status(500).json({ message: 'Error checking duplicate NFC' });
  }
};

exports.issue = async (req, res) => {
  try {
    const { nfc_uid, encryption_version } = req.body;

    // Double check duplicate in backend
    const existingCard = await SmartCard.findOne({ where: { NFC_Chip_ID: nfc_uid } });
    if (existingCard) {
      return res.status(400).json({ message: 'NFC UID already registered' });
    }

    const serialNumber = `SC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCard = await SmartCard.create({
      Card_Serial_No: serialNumber,
      NFC_Chip_ID: nfc_uid,
      Encryption_Version: encryption_version || 'v3.2',
      Issue_Date: new Date(),
      Expiry_Date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      Is_Active: false, // Pending status
      Issued_By: req.user.id
    });

    res.status(201).json(newCard);
  } catch (error) {
    console.error('Issue SmartCard Error:', error);
    res.status(500).json({ message: 'Error issuing smart card' });
  }
};

exports.link = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { card_id, worker_id } = req.body;

    const card = await SmartCard.findByPk(card_id, { transaction: t });
    if (!card) {
      await t.rollback();
      return res.status(404).json({ message: 'Card not found' });
    }

    const worker = await Worker.findByPk(worker_id, { transaction: t });
    if (!worker) {
      await t.rollback();
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Check if worker already has a card
    const existingWorkerCard = await SmartCard.findOne({ where: { Worker_ID: worker_id, Is_Active: true }, transaction: t });
    if (existingWorkerCard) {
      await t.rollback();
      return res.status(400).json({ message: 'Worker already has an active card' });
    }

    await card.update({
      Worker_ID: worker_id,
      Is_Active: true
    }, { transaction: t });

    await worker.update({
      NFC_UID: card.NFC_Chip_ID,
      Primary_Card_Serial: card.Card_Serial_No
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Card linked successfully', card });
  } catch (error) {
    await t.rollback();
    console.error('Link SmartCard Error:', error);
    res.status(500).json({ message: 'Error linking smart card' });
  }
};

exports.cancel = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const card = await SmartCard.findByPk(id, { transaction: t });
    if (!card) {
      await t.rollback();
      return res.status(404).json({ message: 'Card not found' });
    }

    const workerId = card.Worker_ID;

    await card.update({
      Is_Active: false,
      Blacklist_Reason: reason,
      Worker_ID: null
    }, { transaction: t });

    if (workerId) {
      const worker = await Worker.findByPk(workerId, { transaction: t });
      if (worker) {
        await worker.update({
          NFC_UID: null,
          Primary_Card_Serial: null
        }, { transaction: t });
      }
    }

    await t.commit();
    res.json({ message: 'Card cancelled successfully', card });
  } catch (error) {
    await t.rollback();
    console.error('Cancel SmartCard Error:', error);
    res.status(500).json({ message: 'Error cancelling smart card' });
  }
};
