const express = require('express');
const router = express.Router();
const fieldLogController = require('../controllers/fieldLogController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/log', fieldLogController.logInspection);

module.exports = router;
