const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', sponsorController.getAll);
router.get('/:id', sponsorController.getById);
router.post('/', sponsorController.create);
router.put('/:id', sponsorController.update);
router.delete('/:id', sponsorController.delete);

module.exports = router;
