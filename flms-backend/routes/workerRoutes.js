const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all worker routes
router.use(authMiddleware);

router.get('/', workerController.getAll);
router.get('/:id', workerController.getById);
router.post('/', workerController.create);
router.put('/:id', workerController.update);
router.delete('/:id', workerController.delete);

module.exports = router;
