const { Worker, Sponsor } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const workers = await Worker.findAll({
      include: [{ model: Sponsor, attributes: ['Sponsor_Name'] }]
    });
    res.json(workers);
  } catch (error) {
    console.error('Get All Workers Error:', error);
    res.status(500).json({ message: 'Error retrieving workers' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findByPk(id, {
      include: [{ model: Sponsor, attributes: ['Sponsor_Name'] }]
    });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error('Get Worker By ID Error:', error);
    res.status(500).json({ message: 'Error retrieving worker' });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      Sponsor_ID,
      Passport_Number,
      National_ID,
      Full_Name,
      Nationality,
      Birth_Date,
      Job_Title,
      Current_Status,
      NFC_UID,
      Primary_Card_Serial,
      Phone,
      Residency_Number,
      Residency_Expiry
    } = req.body;

    // Validate Sponsor_ID exists
    if (Sponsor_ID) {
      const sponsor = await Sponsor.findByPk(Sponsor_ID);
      if (!sponsor) {
        return res.status(400).json({ message: 'Invalid Sponsor_ID' });
      }
    }

    const newWorker = await Worker.create({
      Sponsor_ID,
      Passport_Number,
      National_ID,
      Full_Name,
      Nationality,
      Birth_Date,
      Job_Title,
      Current_Status,
      NFC_UID,
      Primary_Card_Serial,
      Phone,
      Residency_Number,
      Residency_Expiry
    });

    res.status(201).json(newWorker);
  } catch (error) {
    console.error('Create Worker Error:', error);
    res.status(500).json({ message: 'Error creating worker' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Sponsor_ID,
      Passport_Number,
      National_ID,
      Full_Name,
      Nationality,
      Birth_Date,
      Job_Title,
      Current_Status,
      NFC_UID,
      Primary_Card_Serial,
      Phone,
      Residency_Number,
      Residency_Expiry
    } = req.body;

    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    await worker.update({
      Sponsor_ID,
      Passport_Number,
      National_ID,
      Full_Name,
      Nationality,
      Birth_Date,
      Job_Title,
      Current_Status,
      NFC_UID,
      Primary_Card_Serial,
      Phone,
      Residency_Number,
      Residency_Expiry
    });

    res.json(worker);
  } catch (error) {
    console.error('Update Worker Error:', error);
    res.status(500).json({ message: 'Error updating worker' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    await worker.destroy();
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Delete Worker Error:', error);
    res.status(500).json({ message: 'Error deleting worker' });
  }
};
