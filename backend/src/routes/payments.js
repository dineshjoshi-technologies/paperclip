const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment/paymentController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

router.post('/webhook', paymentController.handleWebhook);

router.use(authenticate);

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/history', paymentController.getPaymentHistory);

router.get('/subscription', paymentController.getSubscription);
router.post('/subscription/create', paymentController.createSubscription);
router.post('/subscription/cancel', paymentController.cancelSubscription);

router.get('/gateways', authorize('ADMIN', 'SUPER_ADMIN'), paymentController.listGateways);
router.put('/gateways/:provider', authorize('ADMIN', 'SUPER_ADMIN'), paymentController.updateGateway);

module.exports = router;