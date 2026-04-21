const express = require('express');
const router = express.Router();
const biometricController = require('../controllers/biometricController');

router.post('/enroll', biometricController.enroll);

module.exports = router;
