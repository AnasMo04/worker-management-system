const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', sponsorController.getAll);
router.get('/:id', sponsorController.getById);
router.post('/', upload.fields([
  { name: 'commercialReg', maxCount: 1 },
  { name: 'taxCert', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'authLetter', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 },
  { name: 'identityCopy', maxCount: 1 }
]), sponsorController.create);
router.put('/:id', upload.fields([
  { name: 'commercialReg', maxCount: 1 },
  { name: 'taxCert', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'authLetter', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 },
  { name: 'identityCopy', maxCount: 1 }
]), sponsorController.update);
router.delete('/:id', sponsorController.delete);

module.exports = router;
