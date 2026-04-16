const express = require('express');
const router = express.Router();
const { AuditTrail, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

router.get('/', authorize('users', 'view'), async (req, res) => {
  try {
    const logs = await AuditTrail.findAll({
      include: [{ model: User, attributes: ['Name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(logs);
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    res.status(500).json({ message: 'Error retrieving audit logs' });
  }
});

module.exports = router;
