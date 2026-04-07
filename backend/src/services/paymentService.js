const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const emailService = require('./emailService');

let razorpay = null;
const processedWebhookEvents = new Map();

function getRazorpay() {
  if (razorpay) return razorpay;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('Razorpay credentials not configured');
    return null;
  }

  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpay;
}

const PLANS = {
  BASIC: { name: 'Basic', price: 199, interval: 'monthly' },
  PRO: { name: 'Pro', price: 499, interval: 'monthly' },
  ENTERPRISE: { name: 'Enterprise', price: 999, interval: 'monthly' },
};

async function createCustomer(user) {
  const rp = getRazorpay();
  if (!rp) return null;

  try {
    const customer = await rp.customer.create({
      name: user.name || user.email,
      email: user.email,
      contact: user.phone || undefined,
    });
    return customer;
  } catch (error) {
    console.error('Razorpay customer creation failed:', error);
    return null;
  }
}

async function createSubscription(userId, plan, customerId = null) {
  const rp = getRazorpay();
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error('User not found');

  let customer = customerId;
  if (!customer) {
    const razorpayCustomer = await createCustomer(user);
    customer = razorpayCustomer?.id;
  }

  const planConfig = PLANS[plan];
  if (!planConfig) throw new Error('Invalid plan');

  try {
    let subscription;
    if (rp && customer) {
      subscription = await rp.subscription.create({
        customer,
        plan_id: `plan_${plan.toLowerCase()}`,
        quantity: 1,
        billing_start: Math.floor(Date.now() / 1000),
      });
    }

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscriptionRecord = await prisma.subscription.create({
      data: {
        userId,
        plan,
        provider: 'razorpay',
        providerSubscriptionId: subscription?.id || null,
        providerCustomerId: customer,
        status: subscription?.id ? 'ACTIVE' : 'TRIALING',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    return subscriptionRecord;
  } catch (error) {
    console.error('Subscription creation failed:', error);
    throw error;
  }
}

async function createPaymentOrder(userId, amount, currency = 'INR') {
  const rp = getRazorpay();
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error('User not found');

  const amountPaise = Math.round(amount * 100);

  try {
    let order = null;
    if (rp) {
      order = await rp.order.create({
        amount: amountPaise,
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: { userId },
      });
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: amountPaise,
        currency,
        provider: 'razorpay',
        providerPaymentId: order?.id || `mock_${Date.now()}`,
        status: 'PENDING',
        email: user.email,
      },
    });

    return {
      paymentId: payment.id,
      orderId: order?.id,
      amount: amountPaise,
      currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error('Payment order creation failed:', error);
    throw error;
  }
}

async function verifyPaymentSignature(payload, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function isEventProcessed(eventId) {
  return processedWebhookEvents.has(eventId);
}

function markEventProcessed(eventId, metadata = {}) {
  processedWebhookEvents.set(eventId, {
    processedAt: new Date(),
    metadata,
  });
}

function resetProcessedEvents() {
  processedWebhookEvents.clear();
}

async function handleWebhook(payload, signature) {
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      return { success: false, error: 'Invalid JSON payload' };
    }
  }

  const event = payload.event;
  const eventId = payload.payload?.payment?.entity?.id
    || payload.payload?.subscription?.entity?.id;

  if (eventId && isEventProcessed(eventId)) {
    console.log(`Webhook event ${eventId} already processed, skipping`);
    return { success: true, message: 'Already processed' };
  }

  const validSignature = await verifyPaymentSignature(payload, signature);

  if (!validSignature) {
    console.error('Invalid webhook signature');
    return { success: false, error: 'Invalid signature' };
  }

  try {
    switch (event) {
      case 'payment.captured':
        await handlePaymentSuccess(payload.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailure(payload.payload.payment.entity);
        break;
      case 'subscription.activated':
        await handleSubscriptionActivated(payload.payload.subscription.entity);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.payload.subscription.entity);
        break;
      case 'subscription.renewed':
        await handleSubscriptionRenewed(payload.payload.subscription.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    if (eventId) {
      markEventProcessed(eventId, { event });
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return { success: false, error: error.message };
  }
}

async function handlePaymentSuccess(paymentEntity) {
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: paymentEntity.order_id },
    include: { user: true },
  });

  await prisma.payment.updateMany({
    where: { providerPaymentId: paymentEntity.order_id },
    data: {
      status: 'CAPTURED',
      method: paymentEntity.method,
      contact: paymentEntity.contact,
    },
  });

  if (payment?.user) {
    const amount = `${payment.amount / 100} ${payment.currency}`;
    await emailService.sendPaymentConfirmationEmail(
      payment.user.email,
      payment.user.name,
      amount,
      payment.provider || 'One-time Payment',
      paymentEntity.id
    );
  }
}

async function handlePaymentFailure(paymentEntity) {
  await prisma.payment.updateMany({
    where: { providerPaymentId: paymentEntity.order_id },
    data: {
      status: 'FAILED',
      errorCode: paymentEntity.error_code,
      errorMessage: paymentEntity.error_description,
    },
  });
}

async function handleSubscriptionActivated(subscriptionEntity) {
  const sub = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: subscriptionEntity.id },
    include: { user: true },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(subscriptionEntity.billing_start * 1000),
        currentPeriodEnd: new Date(subscriptionEntity.billing_end * 1000),
      },
    });

    if (sub.user) {
      await emailService.sendWelcomeEmail(
        sub.user.email,
        sub.user.name,
        null
      );
    }
  }
}

async function handleSubscriptionCancelled(subscriptionEntity) {
  const sub = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: subscriptionEntity.id },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'CANCELLED', cancelAtPeriodEnd: true },
    });
  }
}

async function handleSubscriptionRenewed(subscriptionEntity) {
  const sub = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: subscriptionEntity.id },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        currentPeriodStart: new Date(subscriptionEntity.billing_start * 1000),
        currentPeriodEnd: new Date(subscriptionEntity.billing_end * 1000),
        status: 'ACTIVE',
      },
    });
  }
}

async function getPaymentHistory(userId) {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

async function getSubscription(userId) {
  return prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
}

async function cancelSubscription(subscriptionId) {
  const rp = getRazorpay();
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) throw new Error('Subscription not found');

  if (rp && subscription.providerSubscriptionId) {
    try {
      await rp.subscription.cancel(subscription.providerSubscriptionId, {
        cancel_at_cycle_end: true,
      });
    } catch (error) {
      console.error('Razorpay cancellation failed:', error);
    }
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: true },
  });
}

module.exports = {
  PLANS,
  createCustomer,
  createSubscription,
  createPaymentOrder,
  verifyPaymentSignature,
  handleWebhook,
  handlePaymentSuccess,
  handlePaymentFailure,
  handleSubscriptionActivated,
  handleSubscriptionCancelled,
  handleSubscriptionRenewed,
  getPaymentHistory,
  getSubscription,
  cancelSubscription,
  getRazorpay,
  isEventProcessed,
  markEventProcessed,
  resetProcessedEvents,
};
