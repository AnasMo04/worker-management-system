const { Sponsor, Worker, DocumentsStore, Sequelize, sequelize } = require('../models');

async function syncSponsorDocuments(sponsor, transaction) {
  const docFields = [
    { field: 'Commercial_Reg_Copy', type: 'Commercial Registration' },
    { field: 'Tax_Cert_Copy', type: 'Tax Certificate' },
    { field: 'License_Copy', type: 'License' },
    { field: 'Auth_Letter_Copy', type: 'Authorization Letter' },
    { field: 'Owner_Photo', type: 'Owner Photo' },
    { field: 'Identity_Copy', type: 'Identity Copy' }
  ];

  for (const doc of docFields) {
    if (sponsor[doc.field]) {
      const [existing, created] = await DocumentsStore.findOrCreate({
        where: {
          Sponsor_ID: sponsor.id,
          Doc_Type: doc.type
        },
        defaults: {
          File_Path: sponsor[doc.field],
          Doc_Number: sponsor.Commercial_Reg_No
        },
        transaction
      });

      if (!created && existing.File_Path !== sponsor[doc.field]) {
        await existing.update({ File_Path: sponsor[doc.field] }, { transaction });
      }
    }
  }
}

exports.getAll = async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const where = includeArchived === 'true' ? {} : { is_archived: false };

    const sponsors = await Sponsor.findAll({
      where,
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM Workers AS worker
              WHERE
                worker.Sponsor_ID = Sponsor.id
            )`),
            'workersCount'
          ]
        ]
      }
    });
    res.json(sponsors);
  } catch (error) {
    console.error('Get All Sponsors Error:', error);
    res.status(500).json({ message: 'Error retrieving sponsors' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findByPk(id, {
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM Workers AS worker
              WHERE
                worker.Sponsor_ID = Sponsor.id
            )`),
            'workersCount'
          ]
        ]
      }
    });
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }
    res.json(sponsor);
  } catch (error) {
    console.error('Get Sponsor By ID Error:', error);
    res.status(500).json({ message: 'Error retrieving sponsor' });
  }
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const data = req.body;

    if (req.files) {
      if (req.files.commercialReg) data.Commercial_Reg_Copy = req.files.commercialReg[0].path.replace(/\\/g, '/');
      if (req.files.taxCert) data.Tax_Cert_Copy = req.files.taxCert[0].path.replace(/\\/g, '/');
      if (req.files.license) data.License_Copy = req.files.license[0].path.replace(/\\/g, '/');
      if (req.files.authLetter) data.Auth_Letter_Copy = req.files.authLetter[0].path.replace(/\\/g, '/');
      if (req.files.ownerPhoto) data.Owner_Photo = req.files.ownerPhoto[0].path.replace(/\\/g, '/');
      if (req.files.identityCopy) data.Identity_Copy = req.files.identityCopy[0].path.replace(/\\/g, '/');
    }

    const {
      Commercial_Reg_No,
      Sponsor_Name,
      Phone,
      Email,
      Address,
      Commercial_Reg_Copy,
      Tax_Cert_Copy,
      License_Copy,
      Auth_Letter_Copy,
      Owner_Name,
      Owner_National_ID,
      Owner_Phone,
      Owner_Email,
      Owner_Photo,
      Identity_Copy
    } = req.body;

    const newSponsor = await Sponsor.create({
      Commercial_Reg_No: data.Commercial_Reg_No,
      Sponsor_Name: data.Sponsor_Name,
      Phone: data.Phone,
      Email: data.Email,
      Address: data.Address,
      Commercial_Reg_Copy: data.Commercial_Reg_Copy,
      Tax_Cert_Copy: data.Tax_Cert_Copy,
      License_Copy: data.License_Copy,
      Auth_Letter_Copy: data.Auth_Letter_Copy,
      Owner_Name: data.Owner_Name,
      Owner_National_ID: data.Owner_National_ID,
      Owner_Phone: data.Owner_Phone,
      Owner_Email: data.Owner_Email,
      Owner_Photo: data.Owner_Photo,
      Identity_Copy: data.Identity_Copy
    }, { transaction: t });

    await syncSponsorDocuments(newSponsor, t);
    await t.commit();

    res.status(201).json(newSponsor);
  } catch (error) {
    await t.rollback();
    console.error('Create Sponsor Error:', error);
    res.status(500).json({ message: 'Error creating sponsor' });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const data = req.body;

    if (req.files) {
      if (req.files.commercialReg) data.Commercial_Reg_Copy = req.files.commercialReg[0].path.replace(/\\/g, '/');
      if (req.files.taxCert) data.Tax_Cert_Copy = req.files.taxCert[0].path.replace(/\\/g, '/');
      if (req.files.license) data.License_Copy = req.files.license[0].path.replace(/\\/g, '/');
      if (req.files.authLetter) data.Auth_Letter_Copy = req.files.authLetter[0].path.replace(/\\/g, '/');
      if (req.files.ownerPhoto) data.Owner_Photo = req.files.ownerPhoto[0].path.replace(/\\/g, '/');
      if (req.files.identityCopy) data.Identity_Copy = req.files.identityCopy[0].path.replace(/\\/g, '/');
    }

    const {
      Commercial_Reg_No,
      Sponsor_Name,
      Phone,
      Email,
      Address,
      Commercial_Reg_Copy,
      Tax_Cert_Copy,
      License_Copy,
      Auth_Letter_Copy,
      Owner_Name,
      Owner_National_ID,
      Owner_Phone,
      Owner_Email,
      Owner_Photo,
      Identity_Copy
    } = req.body;

    const sponsor = await Sponsor.findByPk(id);
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    await sponsor.update({
      Commercial_Reg_No: data.Commercial_Reg_No,
      Sponsor_Name: data.Sponsor_Name,
      Phone: data.Phone,
      Email: data.Email,
      Address: data.Address,
      Commercial_Reg_Copy: data.Commercial_Reg_Copy,
      Tax_Cert_Copy: data.Tax_Cert_Copy,
      License_Copy: data.License_Copy,
      Auth_Letter_Copy: data.Auth_Letter_Copy,
      Owner_Name: data.Owner_Name,
      Owner_National_ID: data.Owner_National_ID,
      Owner_Phone: data.Owner_Phone,
      Owner_Email: data.Owner_Email,
      Owner_Photo: data.Owner_Photo,
      Identity_Copy: data.Identity_Copy
    }, { transaction: t });

    await syncSponsorDocuments(sponsor, t);
    await t.commit();

    res.json(sponsor);
  } catch (error) {
    await t.rollback();
    console.error('Update Sponsor Error:', error);
    res.status(500).json({ message: 'Error updating sponsor' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findByPk(id);
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    // Check if sponsor has workers before archiving (optional)
    const workersCount = await Worker.count({ where: { Sponsor_ID: id, is_archived: false } });
    if (workersCount > 0) {
      return res.status(400).json({ message: 'لا يمكن أرشفة الجهة لوجود أفراد مسجلين عليها' });
    }

    await sponsor.update({ is_archived: true });
    res.json({ message: 'تمت أرشفة الجهة بنجاح' });
  } catch (error) {
    console.error('Delete Sponsor Error:', error);
    res.status(500).json({ message: 'Error deleting sponsor' });
  }
};
