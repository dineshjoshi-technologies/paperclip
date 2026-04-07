
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Payment Controller', () => {
  let paymentController;
  let mockPaymentService, mockPrisma, mockEmailService;

  const createMockReq = (body = {}, params = {}, user = {}, headers = {}) => ({
    body, params, user, headers,
  });

  const createMockRes = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
  });

  beforeEach(() => {
    sinon.reset();

    Object.keys(require.cache).forEach((key) => {
      if (key.includes('paymentController')) {
        delete require.cache[key];
      }
    });

    mockPaymentService = {
      createSubscription: sinon.stub(),
      createPaymentOrder: sinon.stub(),
      verifyPaymentSignature: sinon.stub(),
      handleWebhook: sinon.stub(),
      getPaymentHistory: sinon.stub(),
      getSubscription: sinon.stub(),
      cancelSubscription: sinon.stub(),
    };

    mockPrisma = {
      payment: { create: sinon.stub(), update: sinon.stub(), updateMany: sinon.stub(), findMany: sinon.stub(), findUnique: sinon.stub() },
      user: { findUnique: sinon.stub() },
      subscription: { findFirst: sinon.stub(), findUnique: sinon.stub(), create: sinon.stub(), update: sinon.stub() },
      paymentGateway: { findMany: sinon.stub(), upsert: sinon.stub(), findUnique: sinon.stub(), update: sinon.stub() },
    };

    mockEmailService = {
      sendPaymentConfirmationEmail: sinon.stub().resolves(),
      sendPaymentFailedEmail: sinon.stub().resolves(),
    };

    paymentController = proxyquire('../../src/controllers/payment/paymentController', {
      '../../services/paymentService': mockPaymentService,
      '../../config/prisma': mockPrisma,
      '../../services/emailService': mockEmailService,
    });
  });

  describe('createOrder', () => {
    it('should return 400 if amount is missing', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1' });
      const res = createMockRes();

      await paymentController.createOrder(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should return 400 if amount is negative', async () => {
      const req = createMockReq({ amount: -10 }, {}, { userId: 'user-1' });
      const res = createMockRes();

      await paymentController.createOrder(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should create payment order successfully', async () => {
      const req = createMockReq({ amount: 199 }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.createPaymentOrder.resolves({
        paymentId: 'pay-1',
        orderId: 'order_abc',
        amount: 19900,
        currency: 'INR',
        key: 'rzp_test_key',
      });

      await paymentController.createOrder(req, res);

      assert(mockPaymentService.createPaymentOrder.calledOnceWith('user-1', 199));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: sinon.match({ orderId: 'order_abc' }),
      }));
    });

    it('should handle payment service errors', async () => {
      const req = createMockReq({ amount: 199 }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.createPaymentOrder.rejects(new Error('Service error'));

      await paymentController.createOrder(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('verifyPayment', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = createMockReq({ amount: 199 }, {}, { userId: 'user-1' });
      const res = createMockRes();

      await paymentController.verifyPayment(req, res);

      assert(res.status.calledOnceWith(400));
    });

    it('should return 400 for invalid signature', async () => {
      const req = createMockReq({
        paymentId: 'pay-1',
        razorpayPaymentId: 'pay_abc',
        razorpayOrderId: 'order_abc',
        razorpaySignature: 'invalid_sig',
      }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.verifyPaymentSignature.resolves(false);
      mockPrisma.payment.update.resolves({ id: 'pay-1' });

      await paymentController.verifyPayment(req, res);

      assert(res.status.calledOnceWith(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: sinon.match(/invalid/i),
      }));
    });

    it('should verify and update payment successfully', async () => {
      const req = createMockReq({
        paymentId: 'pay-1',
        razorpayPaymentId: 'pay_abc',
        razorpayOrderId: 'order_abc',
        razorpaySignature: 'valid_sig',
      }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.verifyPaymentSignature.resolves(true);
      mockPrisma.payment.update.resolves({
        id: 'pay-1',
        userId: 'user-1',
        amount: 19900,
        currency: 'INR',
        status: 'CAPTURED',
      });
      mockPrisma.user.findUnique.resolves({ email: 'test@example.com', name: 'Test User' });

      await paymentController.verifyPayment(req, res);

      assert(mockPaymentService.verifyPaymentSignature.calledOnce);
      assert(mockPrisma.payment.update.calledWithMatch({
        where: { id: 'pay-1' },
        data: { status: 'CAPTURED', providerPaymentId: 'pay_abc', method: 'card' },
      }));
      assert(mockEmailService.sendPaymentConfirmationEmail.calledOnce);
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
      }));
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history for user', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.getPaymentHistory.resolves([
        { id: 'pay-1', amount: 19900, status: 'CAPTURED' },
      ]);

      await paymentController.getPaymentHistory(req, res);

      assert(mockPaymentService.getPaymentHistory.calledOnceWith('user-1'));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: sinon.match.array,
      }));
    });

    it('should handle errors', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.getPaymentHistory.rejects(new Error('DB error'));

      await paymentController.getPaymentHistory(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('getSubscription', () => {
    it('should return subscription for user', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.getSubscription.resolves({
        id: 'sub-1',
        plan: 'PRO',
        status: 'ACTIVE',
      });

      await paymentController.getSubscription(req, res);

      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: sinon.match({ plan: 'PRO' }),
      }));
    });

    it('should return null subscription gracefully', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.getSubscription.resolves(null);

      await paymentController.getSubscription(req, res);

      assert(res.status.calledOnceWithExactly(200));
    });
  });

  describe('createSubscription', () => {
    it('should return 400 if plan is missing', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1' });
      const res = createMockRes();

      await paymentController.createSubscription(req, res);

      assert(res.status.calledWith(400));
    });

    it('should return 400 for invalid plan', async () => {
      const req = createMockReq({ plan: 'INVALID' }, {}, { userId: 'user-1' });
      const res = createMockRes();

      await paymentController.createSubscription(req, res);

      assert(res.status.calledWith(400));
    });

    it('should create subscription successfully', async () => {
      const req = createMockReq({ plan: 'BASIC' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.createSubscription.resolves({
        id: 'sub-1',
        plan: 'BASIC',
        status: 'ACTIVE',
      });

      await paymentController.createSubscription(req, res);

      assert(mockPaymentService.createSubscription.calledOnce);
      assert(res.status.calledOnceWith(201));
      assert(res.json.calledOnceWithMatch({
        success: true,
      }));
    });

    it('should handle errors gracefully', async () => {
      const req = createMockReq({ plan: 'BASIC' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPaymentService.createSubscription.rejects(new Error('User not found'));

      await paymentController.createSubscription(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('cancelSubscription', () => {
    it('should return 404 if subscriptionId is missing', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPrisma.subscription.findFirst.resolves(null);

      await paymentController.cancelSubscription(req, res);

      assert(res.status.calledOnceWith(404));
    });

    it('should return 404 if subscription not found for user', async () => {
      const req = createMockReq({ subscriptionId: 'sub-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPrisma.subscription.findFirst.resolves(null);

      await paymentController.cancelSubscription(req, res);

      assert(res.status.calledOnceWith(404));
    });

    it('should cancel subscription successfully', async () => {
      const req = createMockReq({ subscriptionId: 'sub-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPrisma.subscription.findFirst.resolves({ id: 'sub-1', userId: 'user-1' });
      mockPaymentService.cancelSubscription.resolves({
        id: 'sub-1',
        cancelAtPeriodEnd: true,
      });

      await paymentController.cancelSubscription(req, res);

      assert(mockPaymentService.cancelSubscription.calledOnceWith('sub-1'));
      assert(res.status.calledOnceWithExactly(200));
    });

    it('should handle errors', async () => {
      const req = createMockReq({ subscriptionId: 'sub-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockPrisma.subscription.findFirst.resolves({ id: 'sub-1', userId: 'user-1' });
      mockPaymentService.cancelSubscription.rejects(new Error('Not found'));

      await paymentController.cancelSubscription(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('handleWebhook', () => {
    it('should return 400 when webhook processing returns error', async () => {
      const req = { body: {}, headers: {} };
      const res = createMockRes();
      mockPaymentService.handleWebhook.resolves({ success: false, error: 'Missing event' });

      await paymentController.handleWebhook(req, res);

      assert(res.status.calledOnceWith(400));
    });

    it('should process webhook successfully', async () => {
      const req = {
        body: { event: 'payment.captured', payload: { payment: { entity: {} } } },
        headers: { 'x-razorpay-signature': 'test_sig' },
      };
      const res = createMockRes();
      mockPaymentService.handleWebhook.resolves({ success: true });

      await paymentController.handleWebhook(req, res);

      assert(mockPaymentService.handleWebhook.calledOnce);
      assert(res.status.calledOnceWithExactly(200));
    });

    it('should return 400 for invalid webhook signature', async () => {
      const req = {
        body: { event: 'payment.captured' },
        headers: { 'x-razorpay-signature': 'bad_sig' },
      };
      const res = createMockRes();
      mockPaymentService.handleWebhook.resolves({ success: false, error: 'Invalid signature' });

      await paymentController.handleWebhook(req, res);

      assert(res.status.calledOnceWith(400));
    });

    it('should return 500 on webhook processing error', async () => {
      const req = {
        body: { event: 'test' },
        headers: { 'x-razorpay-signature': 'test_sig' },
      };
      const res = createMockRes();
      mockPaymentService.handleWebhook.rejects(new Error('Internal error'));

      await paymentController.handleWebhook(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('listGateways', () => {
    it('should return payment gateways with hidden secrets', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1', role: 'ADMIN' });
      const res = createMockRes();
      mockPrisma.paymentGateway.findMany.resolves([
        { id: 'gw-1', provider: 'razorpay', keySecret: 'secret123', webhookSecret: 'whsec_abc', enabled: true },
      ]);

      await paymentController.listGateways(req, res);

      assert(res.status.calledOnceWithExactly(200));
      const responseData = res.json.firstCall.args[0].data;
      assert.strictEqual(responseData.length, 1);
      assert.strictEqual(responseData[0].keySecret, '••••••••');
      assert.strictEqual(responseData[0].webhookSecret, '••••••••');
    });

    it('should handle null secrets', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1', role: 'ADMIN' });
      const res = createMockRes();
      mockPrisma.paymentGateway.findMany.resolves([
        { id: 'gw-1', provider: 'stripe', keySecret: null, webhookSecret: null, enabled: true },
      ]);

      await paymentController.listGateways(req, res);

      const responseData = res.json.firstCall.args[0].data;
      assert.strictEqual(responseData[0].keySecret, null);
      assert.strictEqual(responseData[0].webhookSecret, null);
    });

    it('should handle errors', async () => {
      const req = createMockReq({}, {}, { userId: 'user-1', role: 'ADMIN' });
      const res = createMockRes();
      mockPrisma.paymentGateway.findMany.rejects(new Error('DB error'));

      await paymentController.listGateways(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('updateGateway', () => {
    it('should create gateway if not exists', async () => {
      const req = createMockReq({
        enabled: true,
        keyId: 'rzp_key',
        keySecret: 'secret',
        webhookSecret: 'whsec_abc',
        testMode: true,
      }, { provider: 'razorpay' }, { userId: 'user-1', role: 'ADMIN' });
      const res = createMockRes();
      mockPrisma.paymentGateway.upsert.resolves({
        id: 'gw-1',
        provider: 'razorpay',
        enabled: true,
        keyId: 'rzp_key',
        keySecret: 'secret',
        webhookSecret: 'whsec_abc',
        testMode: true,
      });

      await paymentController.updateGateway(req, res);

      assert(res.status.calledOnceWithExactly(200));
      const responseData = res.json.firstCall.args[0].data;
      assert.strictEqual(responseData.keySecret, '••••••••');
      assert.strictEqual(responseData.webhookSecret, '••••••••');
    });

    it('should update existing gateway partial fields', async () => {
      const req = createMockReq({
        enabled: false,
      }, { provider: 'stripe' }, { userId: 'user-1', role: 'ADMIN' });
      const res = createMockRes();
      mockPrisma.paymentGateway.upsert.resolves({
        id: 'gw-1',
        provider: 'stripe',
        enabled: false,
        keyId: null,
        keySecret: null,
        webhookSecret: null,
        testMode: false,
      });

      await paymentController.updateGateway(req, res);

      assert(res.status.calledOnceWithExactly(200));
    });

    it('should handle errors', async () => {
      const req = createMockReq({ enabled: true }, { provider: 'razorpay' }, { userId: 'user-1', role: 'ADMIN' });
      const res = createMockRes();
      mockPrisma.paymentGateway.upsert.rejects(new Error('DB error'));

      await paymentController.updateGateway(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });
});
