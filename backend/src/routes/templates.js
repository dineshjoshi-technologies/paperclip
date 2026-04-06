const express = require('express');
const router = express.Router();
const templateController = require('../../controllers/template/templateController');
const { authenticate } = require('../../middleware/authMiddleware');

router.get('/', templateController.list);
router.get('/:id', templateController.getById);

// Admin-only routes
router.post('/', authenticate, templateController.create);
router.put('/:id', authenticate, templateController.update);
router.delete('/:id', authenticate, templateController.delete);

module.exports = router;