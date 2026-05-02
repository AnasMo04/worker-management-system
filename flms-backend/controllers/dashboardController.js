const { Worker, SmartCard, LegalCase, Financial, FieldLog, AuditTrail, User, Device, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * System-wide Global Summary for WEB ADMIN
 */
exports.getSystemSummary = async (req, res) => {
  try {
    const totalWorkers = await Worker.count();
    const activeCards = await SmartCard.count({ where: { Is_Active: true } });

    const openLegalCases = await LegalCase.count({
        where: {
            Status: ['Open', 'pending', 'active', 'open', 'نشط']
        }
    });

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
      limit: 10,
      order: [['Scan_Time', 'DESC']],
      include: [
        { model: Worker, attributes: ['Full_Name'] },
        { model: User, attributes: ['Name'] }
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
    console.error('Get System Summary Error:', error);
    res.status(500).json({ message: 'Error retrieving system summary' });
  }
};

/**
 * User-specific Summary for MOBILE OFFICER
 */
exports.getOfficerSummary = async (req, res) => {
  try {
    const officerId = req.user.id;
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

    const activeAlerts = 5; // System placeholder

    const recentInspections = await FieldLog.findAll({
      where: { Officer_ID: officerId },
      limit: 5,
      order: [['Scan_Time', 'DESC']],
      include: [
        { model: Worker, attributes: ['Full_Name'] }
      ]
    });

    res.json({
      counts: {
        todayInspections,
        myViolations,
        activeAlerts
      },
      recentInspections
    });
  } catch (error) {
    console.error('Get Officer Summary Error:', error);
    res.status(500).json({ message: 'Error retrieving officer summary' });
  }
};
