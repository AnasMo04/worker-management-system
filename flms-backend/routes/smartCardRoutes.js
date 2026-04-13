const express = require('express');
const router = express.Router();
const smartCardController = require('../controllers/smartCardController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', smartCardController.getAll);
router.get('/check-duplicate', smartCardController.checkDuplicate);
router.post('/issue', smartCardController.issue);
router.post('/link', smartCardController.link);
router.post('/cancel/:id', smartCardController.cancel);

module.exports = router;
