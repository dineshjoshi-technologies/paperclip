const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Subscription Service', () => {
  let subscriptionService;
  let mockPrisma, mockPaymentService, mockEmailService;

  function loadWithEnv(envObj) {
    Object.keys(require.cache).forEach((key) => {
      if (key.includes('subscriptionService')) {
        delete require.cache[key];
      }
    });

    mockPrisma = {
      subscription: {
        findFirst: sinon.stub(),
        findUnique: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
      },
      website: { count: sinon.stub() },
      userOnboardingMilestone: { upsert: sinon.stub() },
    };

    mockPaymentService = {
      PLANS: {
        BASIC: { price: 199 },
        PRO: { price: 499 },
        ENTERPRISE: { price: 999 },
      },
    };

    mockEmailService = {
      sendPaymentConfirmationEmail: sinon.stub().resolves({ success: true }),
    };

    subscriptionService = proxyquire('../../src/services/subscriptionService', {
      '../config/prisma': mockPrisma,
      './paymentService': mockPaymentService,
      './emailService': mockEmailService,
    });
  }

  beforeEach(() => {
    sinon.reset();
  });

  describe('getPlanIndex', () => {
    it('should return correct index for BASIC plan', () => {
      loadWithEnv({});
      const { getPlanIndex } = subscriptionService;
      assert.strictEqual(getPlanIndex('BASIC'), 0);
    });

    it('should return correct index for PRO plan', () => {
      loadWithEnv({});
      const { getPlanIndex } = subscriptionService;
      assert.strictEqual(getPlanIndex('PRO'), 1);
    });

    it('should return correct index for ENTERPRISE plan', () => {
      loadWithEnv({});
      const { getPlanIndex } = subscriptionService;
      assert.strictEqual(getPlanIndex('ENTERPRISE'), 2);
    });

    it('should return -1 for unknown plan', () => {
      loadWithEnv({});
      const { getPlanIndex } = subscriptionService;
      assert.strictEqual(getPlanIndex('UNKNOWN'), -1);
    });
  });

  describe('createSubscription', () => {
    it('should create subscription with TRIALING status', async () => {
      loadWithEnv({});
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      mockPrisma.subscription.create.resolves({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'BASIC',
        provider: 'razorpay',
        status: 'TRIALING',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });

      const result = await subscriptionService.createSubscription('user-1', 'BASIC');
      assert.strictEqual(result.status, 'TRIALING');
      assert.strictEqual(result.plan, 'BASIC');
      assert(mockPrisma.subscription.create.calledOnce);
    });
  });

  describe('upgradeSubscription', () => {
    it('should throw error when target plan is not an upgrade', async () => {
      loadWithEnv({});
      mockPrisma.subscription.findFirst.resolves({
        id: 'sub-1',
        plan: 'PRO',
        status: 'ACTIVE',
      });

      await assert.rejects(
        () => subscriptionService.upgradeSubscription('user-1', 'BASIC'),
        /Target plan is not an upgrade/
      );
    });

    it('should upgrade subscription successfully', async () => {
      loadWithEnv({});
      const now = new Date();
      mockPrisma.subscription.findFirst.resolves({
        id: 'sub-1',
        plan: 'BASIC',
        status: 'TRIALING',
      });
      mockPrisma.subscription.update.resolves({
        id: 'sub-1',
        plan: 'PRO',
        status: 'ACTIVE',
      });

      const result = await subscriptionService.upgradeSubscription('user-1', 'PRO');
      assert.strictEqual(result.plan, 'PRO');
      assert.strictEqual(result.status, 'ACTIVE');
      assert(mockPrisma.subscription.update.calledOnce);
    });
  });

  describe('downgradeSubscription', () => {
    it('should throw error when target plan is not a downgrade', async () => {
      loadWithEnv({});
      mockPrisma.subscription.findFirst.resolves({
        id: 'sub-1',
        plan: 'BASIC',
        status: 'ACTIVE',
      });

      await assert.rejects(
        () => subscriptionService.downgradeSubscription('user-1', 'PRO'),
        /Target plan is not a downgrade/
      );
    });

    it('should downgrade subscription with cancelAtPeriodEnd', async () => {
      loadWithEnv({});
      mockPrisma.subscription.findFirst.resolves({
        id: 'sub-1',
        plan: 'PRO',
        status: 'ACTIVE',
      });
      mockPrisma.subscription.update.resolves({
        id: 'sub-1',
        plan: 'BASIC',
        cancelAtPeriodEnd: true,
      });

      const result = await subscriptionService.downgradeSubscription('user-1', 'BASIC');
      assert.strictEqual(result.plan, 'BASIC');
      assert.strictEqual(result.cancelAtPeriodEnd, true);
      assert(mockPrisma.subscription.update.calledOnce);
    });
  });

  describe('getSubscriptionDetails', () => {
    it('should return subscription details with usage', async () => {
      loadWithEnv({});
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      mockPrisma.subscription.findFirst.resolves({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'PRO',
        provider: 'razorpay',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
      mockPrisma.website.count.resolves(5);
      
      const result = await subscriptionService.getSubscriptionDetails('user-1');
      assert.strictEqual(result.plan, 'PRO');
      assert.strictEqual(result.price, 499);
      assert.deepStrictEqual(result.usage, {
        current: { websites: 5 },
        limits: { websites: 10, customDomain: true, support: 'priority' },
      });
    });

    it('should return null when no subscription found', async () => {
      loadWithEnv({});
      mockPrisma.subscription.findFirst.resolves(null);
      
      const result = await subscriptionService.getSubscriptionDetails('user-1');
      assert.strictEqual(result, null);
    });
  });

  describe('getPlanUsage', () => {
    it('should return usage for BASIC plan', async () => {
      loadWithEnv({});
      mockPrisma.website.count.resolves(3);
      
      const result = await subscriptionService.getPlanUsage('user-1', 'BASIC');
      assert.deepStrictEqual(result, {
        current: { websites: 3 },
        limits: { websites: 1, customDomain: false, support: 'community' },
      });
    });

    it('should return usage for ENTERPRISE plan', async () => {
      loadWithEnv({});
      mockPrisma.website.count.resolves(15);
      
      const result = await subscriptionService.getPlanUsage('user-1', 'ENTERPRISE');
      assert.deepStrictEqual(result, {
        current: { websites: 15 },
        limits: { websites: -1, customDomain: true, support: 'dedicated' },
      });
    });
  });

  describe('renewSubscription', () => {
    it('should throw error when subscription not found', async () => {
      loadWithEnv({});
      mockPrisma.subscription.findUnique.resolves(null);
      
      await assert.rejects(
        () => subscriptionService.renewSubscription('nonexistent'),
        /Subscription not found/
      );
    });

    it('should renew subscription and send confirmation email', async () => {
      loadWithEnv({});
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      mockPrisma.subscription.findUnique.resolves({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'BASIC',
        currentPeriodEnd: now,
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      mockPrisma.subscription.update.resolves({
        id: 'sub-1',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
      });

      const result = await subscriptionService.renewSubscription('sub-1');
      assert.strictEqual(result.status, 'ACTIVE');
      assert.strictEqual(result.cancelAtPeriodEnd, false);
      assert(mockPrisma.subscription.update.calledOnce);
      assert(mockEmailService.sendPaymentConfirmationEmail.calledOnce);
    });
  });
});
