const express = require('express')
const router = express.Router()
const referralController = require('../controllers/referral.controller')
const { authenticateToken } = require('../middleware/auth.middleware')
const { body, param } = require('express-validator')

// All routes require authentication
router.use(authenticateToken)

// Create a new referral
router.post(
  '/',
  [
    body('referrerId').notEmpty().withMessage('Referrer ID is required'),
    body('refereeId').notEmpty().withMessage('Referee ID is required')
  ],
  referralController.createReferral
)

// Get all referrals for the authenticated user (as referrer)
router.get('/my', referralController.getMyReferrals)

// Get all referrals where the authenticated user is the referee
router.get('/to-me', referralController.getReferralsToMe)

// Update referral status
router.put(
  '/:referralId',
  [
    param('referralId').notEmpty().withMessage('Referral ID is required'),
    body('status').notEmpty().withMessage('Status is required').isIn(['PENDING', 'COMPLETED', 'REWARDED']).withMessage('Invalid status'),
    body('rewardDate').optional().isISO8601().withMessage('Reward date must be a valid date')
  ],
  referralController.updateReferralStatus
)

module.exports = router