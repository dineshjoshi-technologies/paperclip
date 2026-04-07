const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Email Service', () => {
  let emailService;
  let mockPrisma;
  let mockTransporter;

  function loadEmailService() {
    Object.keys(require.cache).forEach((key) => {
      if (key.includes('emailService')) {
        delete require.cache[key];
      }
    });

    mockPrisma = {
      emailLog: {
        create: sinon.stub(),
        update: sinon.stub(),
      },
    };

    mockTransporter = {
      sendMail: sinon.stub(),
    };

    const NodemailerMock = {
      createTransport: sinon.stub().returns(mockTransporter),
    };

    emailService = proxyquire('../../src/services/emailService', {
      '../config/prisma': mockPrisma,
      nodemailer: NodemailerMock,
    }, { noCallThru: true });
  }

  beforeEach(() => {
    sinon.reset();
    delete process.env.EMAIL_API_KEY;
    delete process.env.EMAIL_PROVIDER;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
    delete process.env.FRONTEND_URL;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    delete process.env.EMAIL_API_KEY;
    delete process.env.EMAIL_PROVIDER;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
    delete process.env.FRONTEND_URL;
    delete process.env.NODE_ENV;
  });

  describe('getTransporter', () => {
    it('should create Resend transporter when configured', () => {
      process.env.EMAIL_API_KEY = 'test-api-key';
      process.env.EMAIL_PROVIDER = 'resend';
      loadEmailService();

      const transporter = emailService.getTransporter();
      assert.ok(transporter);
    });

    it('should create SMTP transporter when configured', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'user';
      process.env.SMTP_PASS = 'pass';
      loadEmailService();

      const transporter = emailService.getTransporter();
      assert.ok(transporter);
    });

    it('should fallback to jsonTransport when no provider configured', () => {
      loadEmailService();

      const transporter = emailService.getTransporter();
      assert.ok(transporter);
    });
  });

  describe('sendEmail', () => {
    it('should send welcome email via sendEmail', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });
      mockPrisma.emailLog.update.resolves({});
      mockTransporter.sendMail.resolves({ messageId: 'msg-1' });

      const result = await emailService.sendWelcomeEmail('test@example.com', 'John', 'verify-token-123');

      assert.strictEqual(result.success, true);
      assert(mockPrisma.emailLog.create.calledOnce);
      assert(mockPrisma.emailLog.update.calledOnce);
      assert(mockTransporter.sendMail.calledOnce);
    });

    it('should send password reset email', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });
      mockPrisma.emailLog.update.resolves({});
      mockTransporter.sendMail.resolves({ messageId: 'msg-1' });

      const result = await emailService.sendPasswordResetEmail('test@example.com', 'John', 'reset-token-123');

      assert.strictEqual(result.success, true);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with verification link', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });
      mockPrisma.emailLog.update.resolves({});
      mockTransporter.sendMail.resolves({ messageId: 'msg-1' });

      const result = await emailService.sendWelcomeEmail('user@example.com', 'John', 'verify-token-123');

      assert.strictEqual(result.success, true);
      assert(mockPrisma.emailLog.create.calledOnce);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with reset link', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });
      mockPrisma.emailLog.update.resolves({});
      mockTransporter.sendMail.resolves({ messageId: 'msg-1' });

      const result = await emailService.sendPasswordResetEmail('user@example.com', 'John', 'reset-token-123');

      assert.strictEqual(result.success, true);
      assert(mockPrisma.emailLog.create.calledOnce);
    });
  });

  describe('sendPaymentConfirmationEmail', () => {
    it('should send payment confirmation email', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });
      mockPrisma.emailLog.update.resolves({});
      mockTransporter.sendMail.resolves({ messageId: 'msg-1' });

      const result = await emailService.sendPaymentConfirmationEmail(
        'user@example.com',
        'John',
        '₹199',
        'Basic Plan',
        'txn-123'
      );

      assert.strictEqual(result.success, true);
    });
  });

  describe('sendPaymentFailedEmail', () => {
    it('should send payment failure email', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });
      mockPrisma.emailLog.update.resolves({});
      mockTransporter.sendMail.resolves({ messageId: 'msg-1' });

      const result = await emailService.sendPaymentFailedEmail('user@example.com', 'John', '₹199', 'Basic Plan');

      assert.strictEqual(result.success, true);
    });
  });

  describe('sendSubscriptionExpiredEmail', () => {
    it('should send subscription expired email', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });
      mockPrisma.emailLog.update.resolves({});
      mockTransporter.sendMail.resolves({ messageId: 'msg-1' });

      const result = await emailService.sendSubscriptionExpiredEmail('user@example.com', 'John', 'Basic Plan');

      assert.strictEqual(result.success, true);
    });
  });

  describe('sendWebsitePublishedEmail', () => {
    it('should send website published notification', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });
      mockPrisma.emailLog.update.resolves({});
      mockTransporter.sendMail.resolves({ messageId: 'msg-1' });

      const result = await emailService.sendWebsitePublishedEmail(
        'user@example.com',
        'John',
        'My Website',
        'https://mywebsite.example.com'
      );

      assert.strictEqual(result.success, true);
    });
  });

  describe('logEmail and updateEmailStatus', () => {
    it('should log email to database', async () => {
      loadEmailService();
      mockPrisma.emailLog.create.resolves({ id: 'log-1' });

      const result = await emailService.logEmail('WELCOME', 'user@example.com', 'Welcome!', 'user-1');
      assert.strictEqual(result?.id, 'log-1');
      assert(mockPrisma.emailLog.create.calledOnce);
    });

    it('should update email status', async () => {
      loadEmailService();
      mockPrisma.emailLog.update.resolves({});

      await emailService.updateEmailStatus('log-1', 'SENT');
      assert(mockPrisma.emailLog.update.calledOnce);
      const callArgs = mockPrisma.emailLog.update.firstCall.args[0];
      assert.strictEqual(callArgs.where.id, 'log-1');
      assert.strictEqual(callArgs.data.status, 'SENT');
    });
  });
});
