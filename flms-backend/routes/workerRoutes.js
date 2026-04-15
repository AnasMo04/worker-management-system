const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protect all worker routes
router.use(authMiddleware);

router.get('/', workerController.getAll);
router.get('/:id', workerController.getById);
router.post('/', upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'healthCert', maxCount: 1 },
  { name: 'residencyPhoto', maxCount: 1 },
  { name: 'personalPhoto', maxCount: 1 }
]), workerController.create);
router.put('/:id', upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'healthCert', maxCount: 1 },
  { name: 'residencyPhoto', maxCount: 1 },
  { name: 'personalPhoto', maxCount: 1 }
]), workerController.update);
router.delete('/:id', workerController.delete);

module.exports = router;
