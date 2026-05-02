const { Worker, SmartCard, LegalCase, Financial, FieldLog, AuditTrail, User, Device, sequelize } = require('../models');

exports.getSummary = async (req, res) => {
  try {
    const officerId = req.user.id;

    // User specific stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayInspections = await FieldLog.count({
      where: {
        Officer_ID: officerId,
        Scan_Time: { [Op.gte]: today }
      }
    });

    const myViolations = await FieldLog.count({
      where: {
        Officer_ID: officerId,
        Result: 'مخالفة'
      }
    });

    const activeAlerts = 5; // Placeholder or system-wide alerts

    const totalWorkers = await Worker.count();
    const activeCards = await SmartCard.count({ where: { Is_Active: true } });

    // Using simple count as a placeholder if Status might be different in actual DB
    // In many systems 'Open' or 'pending' are common
    const openLegalCases = await LegalCase.count({
        where: {
            Status: ['Open', 'pending', 'active']
        }
    });

    // Sum of amounts for pending financials
    const pendingPaymentsResult = await Financial.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('Amount')), 'total']],
      where: { Status: ['Pending', 'pending'] }
    });
    const pendingPayments = pendingPaymentsResult[0].dataValues.total || 0;

    const statusBreakdown = await Worker.findAll({
      attributes: ['Current_Status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['Current_Status']
    });

    const recentInspections = await FieldLog.findAll({
      where: { Officer_ID: officerId },
      limit: 5,
      order: [['Scan_Time', 'DESC']],
      include: [
        { model: Worker, attributes: ['Full_Name'] }
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
        pendingPayments,
        todayInspections,
        myViolations,
        activeAlerts
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
