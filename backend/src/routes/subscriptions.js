const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription/subscriptionController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/plans', subscriptionController.getPlans);
router.get('/', subscriptionController.getSubscription);
router.post('/', subscriptionController.createSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/renew', subscriptionController.renewSubscription);
router.post('/upgrade', subscriptionController.upgradeSubscription);
router.post('/downgrade', subscriptionController.downgradeSubscription);

module.exports = router;
