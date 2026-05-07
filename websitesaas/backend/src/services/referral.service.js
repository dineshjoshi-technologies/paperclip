const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const createReferral = async ({ referrerId, refereeId }) => {
  // Check if referrer exists
  const referrer = await prisma.user.findUnique({ where: { id: referrerId } })
  if (!referrer) {
    throw new Error('Referrer not found')
  }
  
  // Check if referee exists
  const referee = await prisma.user.findUnique({ where: { id: refereeId } })
  if (!referee) {
    throw new Error('Referee not found')
  }
  
  // Check if referral already exists
  const existingReferral = await prisma.referral.findFirst({
    where: {
      OR: [
        { referrerId, refereeId },
        { referrerId: refereeId, refereeId: referrerId }
      ]
    }
  })
  
  if (existingReferral) {
    throw new Error('Referral already exists between these users')
  }
  
  // Create referral
  const referral = await prisma.referral.create({
    data: {
      referrerId,
      refereeId,
      status: 'PENDING'
    }
  })
  
  return referral
}

const getReferralsByReferrerId = async (referrerId) => {
  return await prisma.referral.findMany({
    where: { referrerId },
    include: {
      referee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

const getReferralsByRefereeId = async (refereeId) => {
  return await prisma.referral.findMany({
    where: { refereeId },
    include: {
      referrer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

const getReferralById = async (referralId) => {
  return await prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      referrer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      referee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

const updateReferralStatus = async (referralId, status, rewardDate = null) => {
  const validStatuses = ['PENDING', 'COMPLETED', 'REWARDED']
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid referral status')
  }
  
  const referral = await prisma.referral.update({
    where: { id: referralId },
    data: {
      status,
      ...(rewardDate && { rewardDate })
    }
  })
  
  return referral
}

const initReferralService = () => {
  console.log('[REFERRAL] Service initialized')
}

module.exports = {
  createReferral,
  getReferralsByReferrerId,
  getReferralsByRefereeId,
  getReferralById,
  updateReferralStatus,
  initReferralService
}