const { Sponsor, Worker, Sequelize } = require('../models');

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
  try {
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
    });

    res.status(201).json(newSponsor);
  } catch (error) {
    console.error('Create Sponsor Error:', error);
    res.status(500).json({ message: 'Error creating sponsor' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
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
    });

    res.json(sponsor);
  } catch (error) {
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
