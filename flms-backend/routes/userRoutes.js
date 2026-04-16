const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

router.get('/', authorize('users', 'view'), userController.getAll);
router.get('/:id', authorize('users', 'view'), userController.getById);
router.post('/', authorize('users', 'create'), userController.create);
router.put('/:id', authorize('users', 'edit'), userController.update);
router.delete('/:id', authorize('users', 'delete'), userController.delete);

module.exports = router;
