const { LegalCase, sequelize } = require('../models');

exports.getMyCases = async (req, res) => {
  try {
    const Officer_ID = req.user.id;
    const cases = await LegalCase.findAll({
      where: { Reported_By: Officer_ID },
      order: [['Report_Date', 'DESC']]
    });
    res.json(cases);
  } catch (error) {
    console.error('Get My Cases Error:', error);
    res.status(500).json({ message: 'Error retrieving cases' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const Reported_By = req.user.id;

    const openCount = await LegalCase.count({ where: { Reported_By, Status: ['Open', 'open', 'نشط'] } });
    const reviewCount = await LegalCase.count({ where: { Reported_By, Status: ['Review', 'pending', 'قيد المراجعة'] } });
    const closedCount = await LegalCase.count({ where: { Reported_By, Status: ['Closed', 'closed', 'مغلق'] } });

    res.json({
        open: openCount,
        review: reviewCount,
        closed: closedCount
    });
  } catch (error) {
    console.error('Get Legal Case Summary Error:', error);
    res.status(500).json({ message: 'Error retrieving summary' });
  }
};
