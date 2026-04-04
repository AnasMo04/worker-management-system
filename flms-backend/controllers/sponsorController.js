const { Sponsor, Worker, Sequelize } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const sponsors = await Sponsor.findAll({
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
      Auth_Letter_Copy
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
      Auth_Letter_Copy
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
      Auth_Letter_Copy
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
      Auth_Letter_Copy
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

    // Check if sponsor has workers before deleting (optional but recommended)
    const workersCount = await Worker.count({ where: { Sponsor_ID: id } });
    if (workersCount > 0) {
      return res.status(400).json({ message: 'Cannot delete sponsor with associated workers' });
    }

    await sponsor.destroy();
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    console.error('Delete Sponsor Error:', error);
    res.status(500).json({ message: 'Error deleting sponsor' });
  }
};
