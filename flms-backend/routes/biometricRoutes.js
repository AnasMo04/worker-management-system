const express = require('express');
const router = express.Router();
const biometricController = require('../controllers/biometricController');

router.post('/enroll', biometricController.enroll);
router.post('/identify', biometricController.identify);
router.post('/capture', biometricController.toggleCapture);
router.get('/status', biometricController.getStatus);

module.exports = router;
