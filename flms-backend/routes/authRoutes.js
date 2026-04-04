const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// لما يجي طلب POST لهذا الرابط، نفذ دالة login
router.post('/login', authController.login);

module.exports = router;