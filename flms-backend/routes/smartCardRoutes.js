const express = require('express');
const router = express.Router();
const smartCardController = require('../controllers/smartCardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

router.get('/', authorize('smartcards', 'view'), smartCardController.getAll);
router.get('/check-duplicate', authorize('smartcards', 'create'), smartCardController.checkDuplicate);
router.post('/issue', authorize('smartcards', 'create'), smartCardController.issue);
router.post('/link', authorize('smartcards', 'edit'), smartCardController.link);
router.post('/cancel/:id', authorize('smartcards', 'delete'), smartCardController.cancel);

module.exports = router;
