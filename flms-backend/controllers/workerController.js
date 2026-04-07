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
      Residence_Address,
      Current_Status,
      NFC_UID,
      Primary_Card_Serial,
      Passport_Copy,
      Health_Cert_Copy,
      Residency_Copy,
      Personal_Photo_Copy,
      Category,
      Document_Type,
      Health_Cert_Expiry,
      Freelance,
      Family_ID,
      Relationship,
      Gender
    } = req.body;

    // Check for duplicate Document Number
    if (Passport_Number) {
      const existing = await Worker.findOne({ where: { Passport_Number: Passport_Number.trim() } });
      if (existing) {
        return res.status(400).json({ message: 'رقم الوثيقة مسجل مسبقاً في النظام' });
      }
    }

    // Validate Sponsor_ID exists (if not freelance)
    if (Sponsor_ID && !Freelance) {
      const sponsor = await Sponsor.findByPk(Sponsor_ID);
      if (!sponsor) {
        return res.status(400).json({ message: 'Invalid Sponsor_ID' });
      }
    }

    const newWorker = await Worker.create({
      Sponsor_ID: Freelance ? null : Sponsor_ID,
      Passport_Number,
      National_ID,
      Full_Name,
      Nationality,
      Birth_Date,
      Residence_Address,
      Current_Status,
      NFC_UID,
      Primary_Card_Serial,
      Passport_Copy,
      Health_Cert_Copy,
      Residency_Copy,
      Personal_Photo_Copy,
      Category,
      Document_Type,
      Health_Cert_Expiry,
      Freelance,
      Family_ID,
      Relationship,
      Gender
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
      Residence_Address,
      Current_Status,
      NFC_UID,
      Primary_Card_Serial,
      Passport_Copy,
      Health_Cert_Copy,
      Residency_Copy,
      Personal_Photo_Copy,
      Category,
      Document_Type,
      Health_Cert_Expiry,
      Freelance,
      Family_ID,
      Relationship,
      Gender
    } = req.body;

    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Check for duplicate Document Number (excluding current)
    if (Passport_Number && Passport_Number.trim() !== worker.Passport_Number) {
      const existing = await Worker.findOne({ where: { Passport_Number: Passport_Number.trim() } });
      if (existing) {
        return res.status(400).json({ message: 'رقم الوثيقة مسجل مسبقاً في النظام' });
      }
    }

    await worker.update({
      Sponsor_ID: Freelance ? null : Sponsor_ID,
      Passport_Number,
      National_ID,
      Full_Name,
      Nationality,
      Birth_Date,
      Residence_Address,
      Current_Status,
      NFC_UID,
      Primary_Card_Serial,
      Passport_Copy,
      Health_Cert_Copy,
      Residency_Copy,
      Personal_Photo_Copy,
      Category,
      Document_Type,
      Health_Cert_Expiry,
      Freelance,
      Family_ID,
      Relationship,
      Gender
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
