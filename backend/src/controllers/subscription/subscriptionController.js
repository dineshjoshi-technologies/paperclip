const subscriptionService = require('../../services/subscriptionService');
const prisma = require('../../config/prisma');
const emailService = require('../../services/emailService');

exports.createSubscription = async (req, res) => {
  try {
    const { plan, customerId } = req.body;
    const userId = req.user.userId;

    const validPlans = ['BASIC', 'PRO', 'ENTERPRISE'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Valid plan is required (BASIC, PRO, ENTERPRISE)',
      });
    }

    const subscription = await subscriptionService.createSubscription(userId, plan);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await emailService.sendWelcomeEmail(user.email, user.name, null);
    }

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await subscriptionService.getSubscriptionDetails(userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.userId;

    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    const cancelled = await subscriptionService.cancelSubscription(subscriptionId);

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled',
      data: cancelled,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.renewSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.userId;

    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    const renewed = await subscriptionService.renewSubscription(subscriptionId);

    res.status(200).json({
      success: true,
      message: 'Subscription renewed successfully',
      data: renewed,
    });
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.upgradeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.userId;

    const validPlans = ['BASIC', 'PRO', 'ENTERPRISE'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Valid plan is required (BASIC, PRO, ENTERPRISE)',
      });
    }

    const subscription = await subscriptionService.upgradeSubscription(userId, plan);

    res.status(200).json({
      success: true,
      message: `Upgraded to ${plan} plan`,
      data: subscription,
    });
  } catch (error) {
    if (error.message.includes('not an upgrade')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.downgradeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.userId;

    const validPlans = ['BASIC', 'PRO', 'ENTERPRISE'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Valid plan is required (BASIC, PRO, ENTERPRISE)',
      });
    }

    const subscription = await subscriptionService.downgradeSubscription(userId, plan);

    res.status(200).json({
      success: true,
      message: `Downgraded to ${plan} plan (effective at period end)`,
      data: subscription,
    });
  } catch (error) {
    if (error.message === 'No active subscription found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('not a downgrade')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Downgrade subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getPlans = async (_req, res) => {
  try {
    const plans = subscriptionService.PLANS;

    res.status(200).json({
      success: true,
      data: Object.entries(plans).map(([key, plan]) => ({
        id: key,
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        currency: 'INR',
      })),
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
