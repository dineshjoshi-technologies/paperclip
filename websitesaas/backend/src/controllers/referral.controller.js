const { validationResult } = require('express-validator')
const referralService = require('../services/referral.service')
const { AppError } = require('../utils/errorHandler')

// Create a new referral
exports.createReferral = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { referrerId, refereeId } = req.body
    
    // Verify that the authenticated user is the referrer
    if (req.user.id !== referrerId) {
      return res.status(403).json({ 
        message: 'You can only create referrals for yourself' 
      })
    }

    const referral = await referralService.createReferral({
      referrerId,
      refereeId
    })

    res.status(201).json({
      message: 'Referral created successfully',
      data: referral
    })
  } catch (error) {
    next(error)
  }
}

// Get all referrals for the authenticated user (as referrer)
exports.getMyReferrals = async (req, res, next) => {
  try {
    const referrals = await referralService.getReferralsByReferrerId(req.user.id)
    
    res.status(200).json({
      message: 'Referrals retrieved successfully',
      data: referrals
    })
  } catch (error) {
    next(error)
  }
}

// Get all referrals where the authenticated user is the referee
exports.getReferralsToMe = async (req, res, next) => {
  try {
    const referrals = await referralService.getReferralsByRefereeId(req.user.id)
    
    res.status(200).json({
      message: 'Referrals retrieved successfully',
      data: referrals
    })
  } catch (error) {
    next(error)
  }
}

// Update referral status (typically called by admin or system when conditions are met)
exports.updateReferralStatus = async (req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { referralId } = req.params
    const { status, rewardDate } = req.body
    
    // Only allow admins or the referrer to update status
    const referral = await referralService.getReferralById(referralId)
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' })
    }
    
    if (req.user.role !== 'ADMIN' && req.user.id !== referral.referrerId) {
      return res.status(403).json({ 
        message: 'You are not authorized to update this referral' 
      })
    }

    const updatedReferral = await referralService.updateReferralStatus(
      referralId, 
      status, 
      rewardDate
    )

    res.status(200).json({
      message: 'Referral status updated successfully',
      data: updatedReferral
    })
  } catch (error) {
    next(error)
  }
}