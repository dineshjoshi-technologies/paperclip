const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Admin-only routes
router.get('/', authorize('ADMIN'), userController.list);
router.get('/:id', authorize('ADMIN'), userController.getById);
router.put('/:id/role', authorize('ADMIN'), userController.updateRole);
router.delete('/:id', authorize('ADMIN'), userController.delete);

module.exports = router;