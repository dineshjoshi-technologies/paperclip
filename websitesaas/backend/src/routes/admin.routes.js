const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')
const { adminOnly } = require('../middleware/adminAuth')

router.use(adminOnly)

router.get('/metrics', adminController.getMetrics)
router.get('/revenue', adminController.getRevenueData)
router.get('/signups', adminController.getSignupsData)
router.get('/subscriptions/distribution', adminController.getSubscriptionDistribution)
router.get('/activity', adminController.getRecentActivity)

module.exports = router
