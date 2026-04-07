import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import * as transactionController from '../controllers/transactionController';
import * as buybackController from '../controllers/buybackController';
import * as adminController from '../controllers/adminController';
import * as adminBuybackController from '../controllers/adminBuybackController';
import * as adminProfitController from '../controllers/adminProfitController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public routes
router.post('/auth/register', authController.authValidators.register, validate, authController.register);
router.post('/auth/login', authController.authValidators.login, validate, authController.login);
router.post('/auth/refresh', authController.authValidators.refreshToken, validate, authController.refreshTokens);
router.post('/auth/logout', authController.logout);

// Authenticated user routes
router.get('/users/me', authenticate, userController.getProfile);
router.put('/users/me', authenticate, userController.updateProfile);
router.post(
  '/users/me/change-password',
  authenticate,
  userController.userValidators.changePassword,
  validate,
  userController.changePassword,
);

// Transaction routes
router.post('/transactions', authenticate, transactionController.createTransaction);
router.get('/transactions', authenticate, transactionController.getUserTransactions);
router.get('/transactions/:id', authenticate, transactionController.getTransaction);

// Buyback routes
router.post('/buyback-requests', authenticate, buybackController.createBuybackRequest);
router.get('/buyback-requests', authenticate, buybackController.getUserBuybackRequests);

// Admin routes
router.get('/admin/users', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), adminController.getUsers);
router.put('/admin/users/:userId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), adminController.updateUser);
router.get('/admin/stats', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), adminController.getStats);

// Admin - Buyback management
router.get(
  '/admin/buyback-requests',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminBuybackController.getAdminBuybackRequests,
);
router.put(
  '/admin/buyback-requests/:id/approve',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminBuybackController.buybackValidators.approve,
  validate,
  adminBuybackController.approveBuybackRequest,
);
router.put(
  '/admin/buyback-requests/:id/reject',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminBuybackController.buybackValidators.reject,
  validate,
  adminBuybackController.rejectBuybackRequest,
);
router.put(
  '/admin/buyback-requests/:id/process',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminBuybackController.buybackValidators.process,
  validate,
  adminBuybackController.processBuybackRequest,
);

// Admin - Profit Distribution management
router.post(
  '/admin/profit-distributions',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminProfitController.createProfitDistribution,
);
router.get(
  '/admin/profit-distributions',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminProfitController.getProfitDistributions,
);
router.get(
  '/admin/profit-distributions/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminProfitController.getProfitDistribution,
);
router.put(
  '/admin/profit-distributions/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminProfitController.updateProfitDistribution,
);
router.post(
  '/admin/profit-distributions/:id/execute',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  adminProfitController.executeProfitDistribution,
);

export default router;
