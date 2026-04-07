const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

const createApp = (mockPrisma, mockPaymentService, mockEmailService) => {
  const app = express();
  app.use(express.json());

  const paymentController = proxyquire('../../src/controllers/payment/paymentController', {
    '../../services/paymentService': mockPaymentService,
    '../../config/prisma': mockPrisma,
    '../../services/emailService': mockEmailService,
  });

  const authenticate = (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
      }
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };

  const authorize = (...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' });
    }
  };

  const paymentsRouter = express.Router();
  paymentsRouter.post('/webhook', paymentController.handleWebhook);
  paymentsRouter.use(authenticate);
  paymentsRouter.post('/create-order', paymentController.createOrder);
  paymentsRouter.post('/verify', paymentController.verifyPayment);
  paymentsRouter.get('/history', paymentController.getPaymentHistory);
  paymentsRouter.get('/subscription', paymentController.getSubscription);
  paymentsRouter.post('/subscription/create', paymentController.createSubscription);
  paymentsRouter.post('/subscription/cancel', paymentController.cancelSubscription);
  paymentsRouter.get('/gateways', authorize('ADMIN', 'SUPER_ADMIN'), paymentController.listGateways);
  paymentsRouter.put('/gateways/:provider', authorize('ADMIN', 'SUPER_ADMIN'), paymentController.updateGateway);

  app.use('/api/payments', paymentsRouter);

  return app;
};

const createTestServer = (app) => {
  const server = http.createServer(app);
  return server;
};

const getToken = (user = {}) => {
  return jwt.sign(
    { userId: user.userId || 'user-123', email: user.email || 'test@example.com', role: user.role || 'USER' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('Payment Controller Integration', () => {
  let mockPrisma;
  let mockPaymentService;
  let mockEmailService;
  let app;
  let server;
  let baseUrl;
  let authToken;
  let adminToken;

  beforeEach(() => {
    sinon.reset();

    mockPrisma = {
      payment: {
        update: sinon.stub(),
      },
      user: {
        findUnique: sinon.stub(),
      },
      subscription: {
        findFirst: sinon.stub(),
      },
      paymentGateway: {
        findMany: sinon.stub(),
        upsert: sinon.stub(),
      },
    };

    mockPaymentService = {
      createPaymentOrder: sinon.stub(),
      verifyPaymentSignature: sinon.stub(),
      getPaymentHistory: sinon.stub(),
      getSubscription: sinon.stub(),
      createSubscription: sinon.stub(),
      cancelSubscription: sinon.stub(),
      handleWebhook: sinon.stub(),
    };

    mockEmailService = {
      sendPaymentConfirmationEmail: sinon.stub(),
    };

    app = createApp(mockPrisma, mockPaymentService, mockEmailService);
    server = createTestServer(app);
    server.listen(0);
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
    authToken = getToken();
    adminToken = getToken({ userId: 'user-123', role: 'ADMIN' });
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
    sinon.restore();
  });

  describe('POST /api/payments/create-order', () => {
    it('should create a payment order', async () => {
      mockPaymentService.createPaymentOrder.resolves({
        orderId: 'order_123',
        amount: 19900,
        currency: 'INR',
      });

      const response = await fetch(`${baseUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ amount: 19900, plan: 'BASIC' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.orderId, 'order_123');
    });

    it('should return 400 if amount is missing', async () => {
      const response = await fetch(`${baseUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan: 'BASIC' }),
      });

      assert.strictEqual(response.status, 400);
    });

    it('should return 400 if amount is negative', async () => {
      const response = await fetch(`${baseUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ amount: -100 }),
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('POST /api/payments/verify', () => {
    it('should verify payment successfully', async () => {
      mockPaymentService.verifyPaymentSignature.returns(true);
      mockPrisma.payment.update.resolves({
        id: 'pay-1',
        status: 'CAPTURED',
        amount: 19900,
        currency: 'INR',
        providerPaymentId: 'pay_abc123',
        userId: 'user-123',
      });
      mockPrisma.user.findUnique.resolves({
        email: 'test@example.com',
        name: 'Test User',
      });
      mockEmailService.sendPaymentConfirmationEmail.resolves();

      const response = await fetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          paymentId: 'pay-1',
          razorpayPaymentId: 'pay_abc123',
          razorpayOrderId: 'order_xyz789',
          razorpaySignature: 'sig_123',
        }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.status, 'CAPTURED');
    });

    it('should return 400 if signature is invalid', async () => {
      mockPaymentService.verifyPaymentSignature.returns(false);
      mockPrisma.payment.update.resolves({
        id: 'pay-1',
        status: 'FAILED',
      });

      const response = await fetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          paymentId: 'pay-1',
          razorpayPaymentId: 'pay_abc123',
          razorpayOrderId: 'order_xyz789',
          razorpaySignature: 'invalid_sig',
        }),
      });

      assert.strictEqual(response.status, 400);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await fetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ paymentId: 'pay-1' }),
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('GET /api/payments/history', () => {
    it('should return payment history', async () => {
      mockPaymentService.getPaymentHistory.resolves([
        { id: 'pay-1', amount: 19900, status: 'CAPTURED', createdAt: new Date() },
      ]);

      const response = await fetch(`${baseUrl}/api/payments/history`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.length, 1);
    });
  });

  describe('GET /api/payments/subscription', () => {
    it('should return subscription details', async () => {
      mockPaymentService.getSubscription.resolves({
        id: 'sub-1',
        plan: 'PRO',
        status: 'ACTIVE',
      });

      const response = await fetch(`${baseUrl}/api/payments/subscription`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.plan, 'PRO');
    });
  });

  describe('POST /api/payments/subscription/create', () => {
    it('should create a subscription', async () => {
      mockPaymentService.createSubscription.resolves({
        id: 'sub-1',
        plan: 'PRO',
        status: 'ACTIVE',
      });

      const response = await fetch(`${baseUrl}/api/payments/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan: 'PRO', customerId: 'cus_123' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.data.plan, 'PRO');
    });

    it('should return 400 if plan is invalid', async () => {
      const response = await fetch(`${baseUrl}/api/payments/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan: 'INVALID_PLAN' }),
      });

      assert.strictEqual(response.status, 400);
    });

    it('should return 400 if plan is missing', async () => {
      const response = await fetch(`${baseUrl}/api/payments/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ customerId: 'cus_123' }),
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('POST /api/payments/subscription/cancel', () => {
    it('should cancel subscription', async () => {
      mockPrisma.subscription.findFirst.resolves({
        id: 'sub-1',
        userId: 'user-123',
        status: 'ACTIVE',
      });
      mockPaymentService.cancelSubscription.resolves({
        id: 'sub-1',
        status: 'CANCELLED',
      });

      const response = await fetch(`${baseUrl}/api/payments/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subscriptionId: 'sub-1' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.status, 'CANCELLED');
    });

    it('should return 404 if subscription not found', async () => {
      mockPrisma.subscription.findFirst.resolves(null);

      const response = await fetch(`${baseUrl}/api/payments/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subscriptionId: 'non-existent' }),
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should handle webhook successfully', async () => {
      mockPaymentService.handleWebhook.resolves({ success: true });

      const response = await fetch(`${baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'valid_signature',
        },
        body: JSON.stringify({ event: 'payment.captured' }),
      });

      assert.strictEqual(response.status, 200);
    });

    it('should return 400 on webhook failure', async () => {
      mockPaymentService.handleWebhook.resolves({ success: false, error: 'Invalid signature' });

      const response = await fetch(`${baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'invalid_signature',
        },
        body: JSON.stringify({ event: 'payment.captured' }),
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('GET /api/payments/gateways (admin)', () => {
    it('should return payment gateways with masked secrets', async () => {
      mockPrisma.paymentGateway.findMany.resolves([
        { id: 'gw-1', provider: 'razorpay', keySecret: 'secret123', webhookSecret: 'webhook_secret', enabled: true },
      ]);

      const response = await fetch(`${baseUrl}/api/payments/gateways`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data[0].keySecret, '••••••••');
      assert.strictEqual(data.data[0].webhookSecret, '••••••••');
    });
  });

  describe('PUT /api/payments/gateways/:provider (admin)', () => {
    it('should update or create payment gateway', async () => {
      mockPrisma.paymentGateway.upsert.resolves({
        id: 'gw-1',
        provider: 'razorpay',
        enabled: true,
        keySecret: 'secret123',
        webhookSecret: 'wh_secret',
      });

      const response = await fetch(`${baseUrl}/api/payments/gateways/razorpay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ enabled: true, keyId: 'key_123' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.keySecret, '••••••••');
    });
  });
});
