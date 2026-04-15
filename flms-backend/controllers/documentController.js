const { DocumentsStore, Worker } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { Sponsor } = require('../models');
    const documents = await DocumentsStore.findAll({
      include: [
        { model: Worker, attributes: ['Full_Name'] },
        { model: Sponsor, attributes: ['Sponsor_Name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Get All Documents Error:', error);
    res.status(500).json({ message: 'Error retrieving documents' });
  }
};
