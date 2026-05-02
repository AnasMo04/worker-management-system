const express = require('express');
const router = express.Router();
const legalCaseController = require('../controllers/legalCaseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/my-cases', legalCaseController.getMyCases);
router.get('/summary', legalCaseController.getSummary);

module.exports = router;
