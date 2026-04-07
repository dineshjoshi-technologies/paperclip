const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/website/websiteController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', websiteController.list);
router.post('/', websiteController.create);
router.get('/:id', websiteController.getById);
router.put('/:id', websiteController.update);
router.delete('/:id', websiteController.delete);

router.get('/:id/pages', websiteController.getPages);
router.post('/:id/pages', websiteController.createPage);

router.get('/:id/templates', websiteController.getTemplates);
router.post('/:id/publish', websiteController.publish);
router.post('/:id/archive', websiteController.archive);

module.exports = router;