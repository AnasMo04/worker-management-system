const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const authorize = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

router.get('/', authorize('sponsors', 'view'), sponsorController.getAll);
router.get('/:id', authorize('sponsors', 'view'), sponsorController.getById);
router.post('/', authorize('sponsors', 'create'), upload.fields([
  { name: 'commercialReg', maxCount: 1 },
  { name: 'taxCert', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'authLetter', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 },
  { name: 'identityCopy', maxCount: 1 }
]), sponsorController.create);
router.put('/:id', authorize('sponsors', 'edit'), upload.fields([
  { name: 'commercialReg', maxCount: 1 },
  { name: 'taxCert', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'authLetter', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 },
  { name: 'identityCopy', maxCount: 1 }
]), sponsorController.update);
router.delete('/:id', authorize('sponsors', 'delete'), sponsorController.delete);

module.exports = router;
