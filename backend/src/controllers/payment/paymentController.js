const paymentService = require('../../services/paymentService');
const prisma = require('../../config/prisma');
const emailService = require('../../services/emailService');

exports.createOrder = async (req, res) => {
  try {
    const { amount, plan } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const order = await paymentService.createPaymentOrder(userId, amount);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!paymentId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'All payment verification fields are required',
      });
    }

    const isValid = paymentService.verifyPaymentSignature(
      { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature },
      razorpaySignature
    );

    if (!isValid) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', errorMessage: 'Invalid payment signature' },
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CAPTURED',
        providerPaymentId: razorpayPaymentId,
        method: 'card',
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: payment.userId },
    });

    if (user) {
      await emailService.sendPaymentConfirmationEmail(
        user.email,
        user.name,
        `${payment.amount / 100} ${payment.currency}`,
        'One-time Payment',
        razorpayPaymentId
      );
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await paymentService.getPaymentHistory(userId);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await paymentService.getSubscription(userId);

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

    const subscription = await paymentService.createSubscription(userId, plan, customerId);

    res.status(201).json({
      success: true,
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

    const cancelled = await paymentService.cancelSubscription(subscriptionId);

    res.status(200).json({
      success: true,
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

exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);

    if (result.success) {
      res.status(200).json({ received: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.listGateways = async (req, res) => {
  try {
    const gateways = await prisma.paymentGateway.findMany();

    const gatewaysWithHiddenSecrets = gateways.map((gw) => ({
      ...gw,
      keySecret: gw.keySecret ? '••••••••' : null,
      webhookSecret: gw.webhookSecret ? '••••••••' : null,
    }));

    res.status(200).json({
      success: true,
      data: gatewaysWithHiddenSecrets,
    });
  } catch (error) {
    console.error('List gateways error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.updateGateway = async (req, res) => {
  try {
    const { provider } = req.params;
    const { enabled, keyId, keySecret, webhookSecret, testMode } = req.body;

    const gateway = await prisma.paymentGateway.upsert({
      where: { provider },
      update: {
        ...(enabled !== undefined && { enabled }),
        ...(keyId && { keyId }),
        ...(keySecret && { keySecret }),
        ...(webhookSecret && { webhookSecret }),
        ...(testMode !== undefined && { testMode }),
      },
      create: {
        provider,
        enabled: enabled ?? true,
        keyId: keyId || null,
        keySecret: keySecret || null,
        webhookSecret: webhookSecret || null,
        testMode: testMode ?? true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        ...gateway,
        keySecret: gateway.keySecret ? '••••••••' : null,
        webhookSecret: gateway.webhookSecret ? '••••••••' : null,
      },
    });
  } catch (error) {
    console.error('Update gateway error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
