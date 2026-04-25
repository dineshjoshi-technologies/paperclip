const prisma = require('../config/prisma');
const paymentService = require('./paymentService');
const emailService = require('./emailService');

const PLAN_PRICES = {
  BASIC: 199,
  PRO: 499,
  ENTERPRISE: 999,
};

const PLAN_ORDER = ['BASIC', 'PRO', 'ENTERPRISE'];

function getPlanIndex(plan) {
  return PLAN_ORDER.indexOf(plan);
}

async function upgradeSubscription(userId, targetPlan) {
  const currentSubscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  if (!currentSubscription) {
    return createSubscription(userId, targetPlan);
  }

  const currentIndex = getPlanIndex(currentSubscription.plan);
  const targetIndex = getPlanIndex(targetPlan);

  if (targetIndex <= currentIndex) {
    throw new Error('Target plan is not an upgrade');
  }

  const updated = await prisma.subscription.update({
    where: { id: currentSubscription.id },
    data: {
      plan: targetPlan,
      ...(currentSubscription.status === 'TRIALING' && { status: 'ACTIVE' }),
    },
  });

  return updated;
}

async function downgradeSubscription(userId, targetPlan) {
  const currentSubscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  if (!currentSubscription) {
    throw new Error('No active subscription found');
  }

  const currentIndex = getPlanIndex(currentSubscription.plan);
  const targetIndex = getPlanIndex(targetPlan);

  if (targetIndex >= currentIndex) {
    throw new Error('Target plan is not a downgrade');
  }

  const updated = await prisma.subscription.update({
    where: { id: currentSubscription.id },
    data: {
      plan: targetPlan,
      cancelAtPeriodEnd: true,
    },
  });

  return updated;
}

async function createSubscription(userId, plan) {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      plan,
      provider: 'razorpay',
      status: 'TRIALING',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  return subscription;
}

async function getSubscriptionDetails(userId) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!subscription) return null;

  const usage = await getPlanUsage(userId, subscription.plan);

  return {
    ...subscription,
    usage,
    price: PLAN_PRICES[subscription.plan] || 0,
  };
}

async function getPlanUsage(userId, plan) {
  const websites = await prisma.website.count({ where: { userId } });

  const limits = {
    BASIC: { websites: 1, customDomain: false, support: 'community' },
    PRO: { websites: 10, customDomain: true, support: 'priority' },
    ENTERPRISE: { websites: -1, customDomain: true, support: 'dedicated' },
  };

  return {
    current: { websites },
    limits: limits[plan] || limits.BASIC,
  };
}

async function renewSubscription(subscriptionId) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { user: true },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  const periodEnd = new Date(subscription.currentPeriodEnd.getTime() + 30 * 24 * 60 * 60 * 1000);

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
      status: 'ACTIVE',
      cancelAtPeriodEnd: false,
    },
  });

  if (subscription.user) {
    const amount = `${PLAN_PRICES[subscription.plan] / 100} INR`;
    await emailService.sendPaymentConfirmationEmail(
      subscription.user.email,
      subscription.user.name,
      amount,
      `${subscription.plan} Plan Renewal`,
      subscription.id
    );
  }

  return updated;
}

module.exports = {
  getPlanIndex,
  upgradeSubscription,
  downgradeSubscription,
  createSubscription,
  getSubscriptionDetails,
  getPlanUsage,
  renewSubscription,
  PLANS: paymentService.PLANS,
};
