const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const crypto = require('crypto');

describe('Payment Service', () => {
  let paymentService;
  let mockPrisma, mockEmailService;
  let mockRazorpayCustomer, mockRazorpaySubscription, mockRazorpayOrder, mockRazorpayConstructor;

  function loadWithEnv(envObj) {
    Object.keys(require.cache).forEach((key) => {
      if (key.includes('paymentService')) {
        delete require.cache[key];
      }
    });

    mockPrisma = {
      user: { findUnique: sinon.stub() },
      payment: { create: sinon.stub(), updateMany: sinon.stub(), findMany: sinon.stub(), findFirst: sinon.stub() },
      subscription: { create: sinon.stub(), findFirst: sinon.stub(), findUnique: sinon.stub(), update: sinon.stub() },
    };

    mockRazorpayCustomer = { create: sinon.stub() };
    mockRazorpaySubscription = { create: sinon.stub(), cancel: sinon.stub() };
    mockRazorpayOrder = { create: sinon.stub() };

    mockRazorpayConstructor = sinon.stub().returns({
      customer: mockRazorpayCustomer,
      subscription: mockRazorpaySubscription,
      order: mockRazorpayOrder,
    });

    mockEmailService = {
      sendPaymentConfirmationEmail: sinon.stub().resolves({ success: true }),
    };

    paymentService = proxyquire('../../src/services/paymentService', {
      '../config/prisma': mockPrisma,
      razorpay: mockRazorpayConstructor,
      './emailService': mockEmailService,
    }, { noCallThru: true });
  }

  beforeEach(() => {
    sinon.reset();
  });

  afterEach(() => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  describe('getRazorpay', () => {
    it('should return null when credentials are missing', () => {
      loadWithEnv({});
      const result = paymentService.getRazorpay();
      assert.strictEqual(result, null);
    });

    it('should return Razorpay instance when credentials exist', () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      const result = paymentService.getRazorpay();
      assert.ok(result !== null);
      assert(mockRazorpayConstructor.calledOnce);
    });
  });

  describe('createCustomer', () => {
    it('should create a Razorpay customer', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockRazorpayCustomer.create.resolves({ id: 'cust_123' });

      // Force getRazorpay to create the instance
      paymentService.getRazorpay();

      const result = await paymentService.createCustomer({ email: 'test@example.com', name: 'Test User' });

      assert(mockRazorpayCustomer.create.calledOnceWithMatch({
        name: 'Test User',
        email: 'test@example.com',
      }));
      assert.strictEqual(result?.id, 'cust_123');
    });

    it('should return null when Razorpay is not configured', async () => {
      loadWithEnv({});
      const result = await paymentService.createCustomer({ email: 'test@example.com' });
      assert.strictEqual(result, null);
    });

    it('should return null when customer creation fails', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockRazorpayCustomer.create.rejects(new Error('API error'));
      paymentService.getRazorpay();

      const result = await paymentService.createCustomer({ email: 'test@example.com' });
      assert.strictEqual(result, null);
    });
  });

  describe('createSubscription', () => {
    it('should throw error when user not found', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.user.findUnique.resolves(null);

      await assert.rejects(
        () => paymentService.createSubscription('user-1', 'BASIC'),
        /User not found/
      );
    });

    it('should throw error for invalid plan', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.user.findUnique.resolves({ id: 'user-1', email: 'test@example.com' });

      await assert.rejects(
        () => paymentService.createSubscription('user-1', 'INVALID_PLAN'),
        /Invalid plan/
      );
    });

    it('should create subscription in mock mode without credentials', async () => {
      loadWithEnv({});
      mockPrisma.user.findUnique.resolves({ id: 'user-1', email: 'test@example.com' });
      mockPrisma.subscription.create.resolves({ id: 'sub-1', plan: 'BASIC', status: 'TRIALING' });

      const result = await paymentService.createSubscription('user-1', 'BASIC');
      assert.strictEqual(result?.status, 'TRIALING');
      assert(mockPrisma.subscription.create.calledOnce);
    });

    it('should create subscription with Razorpay when available', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.user.findUnique.resolves({ id: 'user-1', email: 'test@example.com' });
      mockRazorpayCustomer.create.resolves({ id: 'cust_123' });
      mockRazorpaySubscription.create.resolves({ id: 'sub_rzp_123' });
      mockPrisma.subscription.create.resolves({
        id: 'sub-1', plan: 'BASIC', providerSubscriptionId: 'sub_rzp_123', status: 'ACTIVE',
      });
      paymentService.getRazorpay();

      const result = await paymentService.createSubscription('user-1', 'BASIC');
      assert(mockRazorpaySubscription.create.calledOnce);
      assert.strictEqual(result?.status, 'ACTIVE');
    });
  });

  describe('createPaymentOrder', () => {
    it('should throw error when user not found', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.user.findUnique.resolves(null);

      await assert.rejects(
        () => paymentService.createPaymentOrder('user-1', 199),
        /User not found/
      );
    });

    it('should create payment order with Razorpay', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.user.findUnique.resolves({ id: 'user-1', email: 'test@example.com' });
      mockRazorpayOrder.create.resolves({ id: 'order_abc123' });
      mockPrisma.payment.create.resolves({ id: 'pay-1', providerPaymentId: 'order_abc123', amount: 19900, status: 'PENDING' });
      paymentService.getRazorpay();

      const result = await paymentService.createPaymentOrder('user-1', 199);
      assert(mockRazorpayOrder.create.calledOnce);
      assert.strictEqual(result.amount, 19900);
      assert.strictEqual(result.key, 'rzp_test_key');
    });

    it('should create mock payment order when Razorpay not configured', async () => {
      loadWithEnv({});
      mockPrisma.user.findUnique.resolves({ id: 'user-1', email: 'test@example.com' });
      mockPrisma.payment.create.resolves({ id: 'pay-1', providerPaymentId: 'mock_123', amount: 19900, status: 'PENDING' });

      const result = await paymentService.createPaymentOrder('user-1', 199);
      assert(mockPrisma.payment.create.calledOnce);
    });
  });

  describe('verifyPaymentSignature', () => {
    it('should return false when webhook secret is missing', async () => {
      loadWithEnv({});
      const result = await paymentService.verifyPaymentSignature({}, 'sig');
      assert.strictEqual(result, false);
    });

    it('should return true for valid signature', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      const payload = { event: 'payment.captured' };
      const body = JSON.stringify(payload);
      const signature = crypto.createHmac('sha256', 'whsec_test_secret').update(body).digest('hex');
      const result = await paymentService.verifyPaymentSignature(payload, signature);
      assert.strictEqual(result, true);
    });

    it('should return false for invalid signature', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      const badSig = crypto.createHmac('sha256', 'wrong_secret').update('{"event":"test"}').digest('hex');
      const result = await paymentService.verifyPaymentSignature({ event: 'test' }, badSig);
      assert.strictEqual(result, false);
    });
  });

  describe('handleWebhook', () => {
    it('should return error for invalid signature', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      const badSig = crypto.createHmac('sha256', 'wrong_secret').update('{"event":"test"}').digest('hex');
      const result = await paymentService.handleWebhook({ event: 'payment.captured' }, badSig);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'Invalid signature');
    });

    it('should handle payment.captured event', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      mockPrisma.payment.updateMany.resolves({ count: 1 });
      mockPrisma.payment.updateMany.resetHistory();

      const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { order_id: 'order_abc', method: 'card', contact: '+919876543210' } } } });
      const signature = crypto.createHmac('sha256', 'whsec_test_secret').update(body).digest('hex');
      const payload = JSON.parse(body);

      const result = await paymentService.handleWebhook(payload, signature);
      assert.strictEqual(result.success, true);
      assert(mockPrisma.payment.updateMany.calledOnce);
    });

    it('should handle payment.failed event', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      mockPrisma.payment.updateMany.resolves({ count: 1 });

      const body = JSON.stringify({ event: 'payment.failed', payload: { payment: { entity: { order_id: 'order_xyz', error_code: 'BAD_REQUEST_ERROR', error_description: 'Declined' } } } });
      const signature = crypto.createHmac('sha256', 'whsec_test_secret').update(body).digest('hex');
      const payload = JSON.parse(body);

      const result = await paymentService.handleWebhook(payload, signature);
      assert.strictEqual(result.success, true);
    });

    it('should handle subscription.activated event', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      const now = Math.floor(Date.now() / 1000);
      const body = JSON.stringify({ event: 'subscription.activated', payload: { subscription: { entity: { id: 'sub_123', billing_start: now, billing_end: now + 30 * 24 * 60 * 60 } } } });
      const signature = crypto.createHmac('sha256', 'whsec_test_secret').update(body).digest('hex');
      mockPrisma.subscription.findFirst.resolves({ id: 'sub-1', providerSubscriptionId: 'sub_123' });
      mockPrisma.subscription.update.resolves({});

      const result = await paymentService.handleWebhook(JSON.parse(body), signature);
      assert.strictEqual(result.success, true);
      assert(mockPrisma.subscription.update.calledOnce);
    });

    it('should handle subscription.cancelled event', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      const body = JSON.stringify({ event: 'subscription.cancelled', payload: { subscription: { entity: { id: 'sub_123' } } } });
      const signature = crypto.createHmac('sha256', 'whsec_test_secret').update(body).digest('hex');
      mockPrisma.subscription.findFirst.resolves({ id: 'sub-1' });
      mockPrisma.subscription.update.resolves({});

      const result = await paymentService.handleWebhook(JSON.parse(body), signature);
      assert.strictEqual(result.success, true);
    });

    it('should handle subscription.renewed event', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      const now = Math.floor(Date.now() / 1000);
      const body = JSON.stringify({ event: 'subscription.renewed', payload: { subscription: { entity: { id: 'sub_123', billing_start: now, billing_end: now + 30 * 24 * 60 * 60 } } } });
      const signature = crypto.createHmac('sha256', 'whsec_test_secret').update(body).digest('hex');
      mockPrisma.subscription.findFirst.resolves({ id: 'sub-1' });
      mockPrisma.subscription.update.resolves({});

      const result = await paymentService.handleWebhook(JSON.parse(body), signature);
      assert.strictEqual(result.success, true);
    });

    it('should handle unknown events gracefully', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      const body = JSON.stringify({ event: 'unknown.event', payload: {} });
      const signature = crypto.createHmac('sha256', 'whsec_test_secret').update(body).digest('hex');

      const result = await paymentService.handleWebhook(JSON.parse(body), signature);
      assert.strictEqual(result.success, true);
    });

    it('should return error when webhook processing fails', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret';
      loadWithEnv({});
      mockPrisma.payment.updateMany.rejects(new Error('DB connection lost'));

      const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { order_id: 'order_x' } } } });
      const signature = crypto.createHmac('sha256', 'whsec_test_secret').update(body).digest('hex');

      const result = await paymentService.handleWebhook(JSON.parse(body), signature);
      assert.strictEqual(result.success, false);
      assert(result.error.includes('DB connection lost'));
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history for user', async () => {
      loadWithEnv({});
      mockPrisma.payment.findMany.resolves([{ id: 'pay-1', amount: 19900, status: 'CAPTURED' }]);
      const result = await paymentService.getPaymentHistory('user-1');
      assert.strictEqual(result.length, 1);
    });
  });

  describe('getSubscription', () => {
    it('should return active subscription for user', async () => {
      loadWithEnv({});
      mockPrisma.subscription.findFirst.resolves({ id: 'sub-1', plan: 'PRO', status: 'ACTIVE' });
      const result = await paymentService.getSubscription('user-1');
      assert.strictEqual(result?.plan, 'PRO');
    });
  });

  describe('cancelSubscription', () => {
    it('should throw when subscription not found', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.subscription.findUnique.resolves(null);

      await assert.rejects(
        () => paymentService.cancelSubscription('nonexistent'),
        /Subscription not found/
      );
    });

    it('should cancel subscription in mock mode', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.subscription.findUnique.resolves({ id: 'sub-1', providerSubscriptionId: null });
      mockPrisma.subscription.update.resolves({ id: 'sub-1', cancelAtPeriodEnd: true });

      const result = await paymentService.cancelSubscription('sub-1');
      assert.strictEqual(result?.cancelAtPeriodEnd, true);
    });

    it('should cancel subscription with Razorpay when available', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.subscription.findUnique.resolves({ id: 'sub-1', providerSubscriptionId: 'sub_rzp_123' });
      mockRazorpaySubscription.cancel.resolves({ status: 'cancelled' });
      mockPrisma.subscription.update.resolves({ id: 'sub-1', cancelAtPeriodEnd: true });
      paymentService.getRazorpay();

      const result = await paymentService.cancelSubscription('sub-1');
      assert(mockRazorpaySubscription.cancel.calledOnce);
      assert.strictEqual(result?.cancelAtPeriodEnd, true);
    });

    it('should still update DB even if Razorpay cancellation fails', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
      loadWithEnv({});
      mockPrisma.subscription.findUnique.resolves({ id: 'sub-1', providerSubscriptionId: 'sub_rzp_123' });
      mockRazorpaySubscription.cancel.rejects(new Error('Provider error'));
      mockPrisma.subscription.update.resolves({ id: 'sub-1', cancelAtPeriodEnd: true });
      paymentService.getRazorpay();

      const result = await paymentService.cancelSubscription('sub-1');
      assert(mockRazorpaySubscription.cancel.calledOnce);
      assert.strictEqual(result?.cancelAtPeriodEnd, true);
    });
  });

  describe('PLANS', () => {
    it('should define all plan tiers', () => {
      loadWithEnv({});
      const { PLANS } = paymentService;
      assert.ok(PLANS.BASIC);
      assert.ok(PLANS.PRO);
      assert.ok(PLANS.ENTERPRISE);
      assert.strictEqual(PLANS.BASIC.price, 199);
      assert.strictEqual(PLANS.PRO.price, 499);
      assert.strictEqual(PLANS.ENTERPRISE.price, 999);
    });
  });
});
