const { Worker, Sponsor, DocumentsStore, sequelize } = require('../models');

async function syncDocuments(worker, transaction) {
  const docFields = [
    { field: 'Passport_Copy', type: 'Passport' },
    { field: 'Health_Cert_Copy', type: 'Health Certificate' },
    { field: 'Residency_Copy', type: 'Residency' },
    { field: 'Personal_Photo_Copy', type: 'Personal Photo' }
  ];

  for (const doc of docFields) {
    if (worker[doc.field]) {
      const [existing, created] = await DocumentsStore.findOrCreate({
        where: {
          Worker_ID: worker.id,
          Doc_Type: doc.type
        },
        defaults: {
          File_Path: worker[doc.field],
          Doc_Number: worker.Passport_Number
        },
        transaction
      });

      if (!created && existing.File_Path !== worker[doc.field]) {
        await existing.update({ File_Path: worker[doc.field] }, { transaction });
      }
    }
  }
}

exports.getAll = async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const where = includeArchived === 'true' ? {} : { is_archived: false };

    const workers = await Worker.findAll({
      where,
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
  const t = await sequelize.transaction();
  try {
    const data = { ...req.body };

    // Robust parsing for multipart/form-data
    const isFreelance = data.Freelance === 'true' || data.Freelance === true;
    const parsedSponsorId = (isFreelance || !data.Sponsor_ID || data.Sponsor_ID === 'null' || data.Sponsor_ID === '')
      ? null
      : parseInt(data.Sponsor_ID);

    // Handle files if uploaded via multer
    if (req.files) {
      if (req.files.passportPhoto) data.Passport_Copy = req.files.passportPhoto[0].path.replace(/\\/g, '/');
      if (req.files.healthCert) data.Health_Cert_Copy = req.files.healthCert[0].path.replace(/\\/g, '/');
      if (req.files.residencyPhoto) data.Residency_Copy = req.files.residencyPhoto[0].path.replace(/\\/g, '/');
      if (req.files.personalPhoto) data.Personal_Photo_Copy = req.files.personalPhoto[0].path.replace(/\\/g, '/');
    }

    // Check for duplicate Document Number
    if (data.Passport_Number) {
      const existing = await Worker.findOne({ where: { Passport_Number: data.Passport_Number.trim() } });
      if (existing) {
        return res.status(400).json({ message: 'رقم الوثيقة مسجل مسبقاً في النظام' });
      }
    }

    // Validate Sponsor_ID exists (if not freelance)
    if (parsedSponsorId) {
      const sponsor = await Sponsor.findByPk(parsedSponsorId);
      if (!sponsor) {
        return res.status(400).json({ message: 'Invalid Sponsor_ID' });
      }
    }

    const newWorker = await Worker.create({
      Sponsor_ID: parsedSponsorId,
      Passport_Number: data.Passport_Number,
      National_ID: data.National_ID,
      Full_Name: data.Full_Name,
      Nationality: data.Nationality,
      Birth_Date: data.Birth_Date,
      Residence_Address: data.Residence_Address,
      Current_Status: data.Current_Status,
      NFC_UID: data.NFC_UID,
      Primary_Card_Serial: data.Primary_Card_Serial,
      Passport_Copy: data.Passport_Copy,
      Health_Cert_Copy: data.Health_Cert_Copy,
      Residency_Copy: data.Residency_Copy,
      Personal_Photo_Copy: data.Personal_Photo_Copy,
      Category: data.Category,
      Document_Type: data.Document_Type,
      Health_Cert_Expiry: data.Health_Cert_Expiry,
      Freelance: data.Freelance,
      Family_ID: data.Family_ID,
      Relationship: data.Relationship,
      Gender: data.Gender
    }, { transaction: t });

    await syncDocuments(newWorker, t);
    await t.commit();

    res.status(201).json(newWorker);
  } catch (error) {
    await t.rollback();
    console.error('Create Worker Error:', error);
    res.status(500).json({ message: 'Error creating worker' });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Robust parsing for multipart/form-data
    const isFreelance = data.Freelance === 'true' || data.Freelance === true;
    const parsedSponsorId = (isFreelance || !data.Sponsor_ID || data.Sponsor_ID === 'null' || data.Sponsor_ID === '')
      ? null
      : parseInt(data.Sponsor_ID);

    // Handle files if uploaded via multer
    if (req.files) {
      if (req.files.passportPhoto) data.Passport_Copy = req.files.passportPhoto[0].path.replace(/\\/g, '/');
      if (req.files.healthCert) data.Health_Cert_Copy = req.files.healthCert[0].path.replace(/\\/g, '/');
      if (req.files.residencyPhoto) data.Residency_Copy = req.files.residencyPhoto[0].path.replace(/\\/g, '/');
      if (req.files.personalPhoto) data.Personal_Photo_Copy = req.files.personalPhoto[0].path.replace(/\\/g, '/');
    }

    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Check for duplicate Document Number (excluding current)
    if (data.Passport_Number && data.Passport_Number.trim() !== worker.Passport_Number) {
      const existing = await Worker.findOne({ where: { Passport_Number: data.Passport_Number.trim() } });
      if (existing) {
        return res.status(400).json({ message: 'رقم الوثيقة مسجل مسبقاً في النظام' });
      }
    }

    await worker.update({
      Sponsor_ID: parsedSponsorId,
      Passport_Number: data.Passport_Number,
      National_ID: data.National_ID,
      Full_Name: data.Full_Name,
      Nationality: data.Nationality,
      Birth_Date: data.Birth_Date,
      Residence_Address: data.Residence_Address,
      Current_Status: data.Current_Status,
      NFC_UID: data.NFC_UID,
      Primary_Card_Serial: data.Primary_Card_Serial,
      Passport_Copy: data.Passport_Copy,
      Health_Cert_Copy: data.Health_Cert_Copy,
      Residency_Copy: data.Residency_Copy,
      Personal_Photo_Copy: data.Personal_Photo_Copy,
      Category: data.Category,
      Document_Type: data.Document_Type,
      Health_Cert_Expiry: data.Health_Cert_Expiry,
      Freelance: data.Freelance,
      Family_ID: data.Family_ID,
      Relationship: data.Relationship,
      Gender: data.Gender
    }, { transaction: t });

    await syncDocuments(worker, t);
    await t.commit();

    res.json(worker);
  } catch (error) {
    await t.rollback();
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

    await worker.update({ is_archived: true });
    res.json({ message: 'تمت أرشفت السجل بنجاح' });
  } catch (error) {
    console.error('Delete Worker Error:', error);
    res.status(500).json({ message: 'Error deleting worker' });
  }
};
