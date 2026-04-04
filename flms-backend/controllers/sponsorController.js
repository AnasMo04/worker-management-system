const { Sponsor } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const sponsors = await Sponsor.findAll();
    res.json(sponsors);
  } catch (error) {
    console.error('Get All Sponsors Error:', error);
    res.status(500).json({ message: 'Error retrieving sponsors' });
  }
};
