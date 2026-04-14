const { Worker, SmartCard, LegalCase, Financial, FieldLog, AuditTrail, User, Device, sequelize } = require('../models');

exports.getSummary = async (req, res) => {
  try {
    const totalWorkers = await Worker.count();
    const activeCards = await SmartCard.count({ where: { Is_Active: true } });
    const openLegalCases = await LegalCase.count({ where: { Status: 'Open' } });
    const pendingPayments = await Financial.count({ where: { Status: 'Pending' } });

    const statusBreakdown = await Worker.findAll({
      attributes: ['Current_Status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['Current_Status']
    });

    const recentInspections = await FieldLog.findAll({
      limit: 5,
      order: [['Scan_Time', 'DESC']],
      include: [
        { model: Worker, attributes: ['Full_Name'] },
        { model: User, attributes: ['Name'] },
        { model: Device, attributes: ['id'] }
      ]
    });

    const recentAuditLogs = await AuditTrail.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['Name'] }
      ]
    });

    res.json({
      counts: {
        totalWorkers,
        activeCards,
        openLegalCases,
        pendingPayments
      },
      statusBreakdown,
      recentInspections,
      recentAuditLogs
    });
  } catch (error) {
    console.error('Get Dashboard Summary Error:', error);
    res.status(500).json({ message: 'Error retrieving dashboard data' });
  }
};
