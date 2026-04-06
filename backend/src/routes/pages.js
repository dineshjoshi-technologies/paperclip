const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/page/pageController');
const { authenticate } = require('../../middleware/authMiddleware');

router.use(authenticate);

router.get('/', pageController.list);
router.post('/', pageController.create);
router.get('/:id', pageController.getById);
router.put('/:id', pageController.update);
router.delete('/:id', pageController.delete);

router.get('/:id/components', pageController.getComponents);
router.post('/:id/components', pageController.createComponent);

module.exports = router;