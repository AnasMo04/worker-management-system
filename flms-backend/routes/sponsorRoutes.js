const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', sponsorController.getAll);

module.exports = router;
