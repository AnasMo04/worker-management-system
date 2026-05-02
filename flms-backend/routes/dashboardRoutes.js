const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Global System Summary (Web Admin)
router.get('/system', dashboardController.getSystemSummary);

// Personal Officer Summary (Mobile App)
router.get('/officer', dashboardController.getOfficerSummary);

module.exports = router;
