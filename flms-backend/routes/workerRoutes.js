const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const authorize = require('../middleware/rbacMiddleware');

// Protect all worker routes
router.use(authMiddleware);

router.get('/', authorize('workers', 'view'), workerController.getAll);
router.get('/nfc/:uid', authorize('workers', 'view'), workerController.getByNfcUid);
router.get('/:id', authorize('workers', 'view'), workerController.getById);
router.post('/', authorize('workers', 'create'), upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'healthCert', maxCount: 1 },
  { name: 'residencyPhoto', maxCount: 1 },
  { name: 'personalPhoto', maxCount: 1 }
]), workerController.create);
router.put('/:id', authorize('workers', 'edit'), upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'healthCert', maxCount: 1 },
  { name: 'residencyPhoto', maxCount: 1 },
  { name: 'personalPhoto', maxCount: 1 }
]), workerController.update);
router.delete('/:id', authorize('workers', 'delete'), workerController.delete);

module.exports = router;
