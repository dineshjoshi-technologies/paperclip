const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Invoice Service', () => {
  let invoiceService;
  let mockPrisma;

  beforeEach(() => {
    sinon.reset();

    Object.keys(require.cache).forEach((key) => {
      if (key.includes('invoiceService')) {
        delete require.cache[key];
      }
    });

    mockPrisma = {
      invoice: {
        create: sinon.stub(),
        findFirst: sinon.stub(),
        findMany: sinon.stub(),
        count: sinon.stub(),
        update: sinon.stub(),
        updateMany: sinon.stub(),
        aggregate: sinon.stub(),
      },
    };

    invoiceService = proxyquire('../../src/services/invoiceService', {
      '../config/prisma': mockPrisma,
    });
  });

  describe('generateInvoiceNumber', () => {
    it('should generate a unique invoice number', async () => {
      mockPrisma.invoice.count.resolves(5);

      const result = await invoiceService.generateInvoiceNumber();
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');

      assert(result.startsWith(`INV-${year}${month}-`));
      assert(result.endsWith('000006'));
    });
  });

  describe('createInvoice', () => {
    it('should create an invoice with default tax and currency', async () => {
      mockPrisma.invoice.count.resolves(0);
      mockPrisma.invoice.create.resolves({
        id: 'inv-1',
        invoiceNumber: 'INV-202604000001',
        amount: 10000,
        tax: 0,
        total: 10000,
        status: 'DRAFT',
      });

      const result = await invoiceService.createInvoice({
        userId: 'user-1',
        amount: 10000,
      });

      assert(mockPrisma.invoice.create.calledOnce);
      const createdData = mockPrisma.invoice.create.firstCall.args[0].data;
      assert.strictEqual(createdData.tax, 0);
      assert.strictEqual(createdData.currency, 'INR');
      assert.strictEqual(createdData.status, 'DRAFT');
    });

    it('should create an invoice with custom values', async () => {
      mockPrisma.invoice.count.resolves(0);
      mockPrisma.invoice.create.resolves({
        id: 'inv-1',
        invoiceNumber: 'INV-202604-000001',
        amount: 15000,
        tax: 2700,
        total: 17700,
        currency: 'USD',
        status: 'DRAFT',
      });

      const dueDate = new Date('2026-05-01');

      await invoiceService.createInvoice({
        userId: 'user-1',
        amount: 15000,
        tax: 2700,
        currency: 'USD',
        dueDate,
        lineItems: [{ description: 'Pro Plan', amount: 15000, quantity: 1 }],
        notes: 'First payment',
      });

      const createdData = mockPrisma.invoice.create.firstCall.args[0].data;
      assert.strictEqual(createdData.tax, 2700);
      assert.strictEqual(createdData.currency, 'USD');
      assert.strictEqual(createdData.userId, 'user-1');
    });
  });

  describe('getInvoice', () => {
    it('should return invoice for user', async () => {
      mockPrisma.invoice.findFirst.resolves({
        id: 'inv-1',
        invoiceNumber: 'INV-202604-000001',
        amount: 10000,
        status: 'PAID',
      });

      const result = await invoiceService.getInvoice('user-1', 'inv-1');

      assert(mockPrisma.invoice.findFirst.calledOnce);
      assert.strictEqual(result.status, 'PAID');
    });

    it('should return null if invoice not found or not owned by user', async () => {
      mockPrisma.invoice.findFirst.resolves(null);

      const result = await invoiceService.getInvoice('user-1', 'inv-nonexistent');

      assert.strictEqual(result, null);
    });
  });

  describe('getInvoicesByUser', () => {
    it('should return paginated invoices', async () => {
      mockPrisma.invoice.findMany.resolves([
        { id: 'inv-1', amount: 10000, status: 'PAID' },
        { id: 'inv-2', amount: 15000, status: 'ISSUED' },
      ]);
      mockPrisma.invoice.count.resolves(2);

      const result = await invoiceService.getInvoicesByUser('user-1');

      assert.strictEqual(result.invoices.length, 2);
      assert.strictEqual(result.pagination.total, 2);
      assert.strictEqual(result.pagination.totalPages, 1);
    });

    it('should filter by status', async () => {
      mockPrisma.invoice.findMany.resolves([]);
      mockPrisma.invoice.count.resolves(0);

      await invoiceService.getInvoicesByUser('user-1', { status: 'PAID' });

      const whereClause = mockPrisma.invoice.findMany.firstCall.args[0].where;
      assert.strictEqual(whereClause.status, 'PAID');
    });
  });

  describe('updateInvoice', () => {
    it('should throw if invoice not found', async () => {
      mockPrisma.invoice.findFirst.resolves(null);

      await assert.rejects(
        () => invoiceService.updateInvoice('user-1', 'inv-nonexistent', { notes: 'test' }),
        /Invoice not found/,
      );
    });

    it('should update invoice with allowed fields only', async () => {
      mockPrisma.invoice.findFirst.resolves({
        id: 'inv-1',
        userId: 'user-1',
        status: 'DRAFT',
      });
      mockPrisma.invoice.update.resolves({
        id: 'inv-1',
        status: 'DRAFT',
        notes: 'New notes',
      });

      await invoiceService.updateInvoice('user-1', 'inv-1', {
        notes: 'New notes',
        amount: 99999, // Should be ignored - not in allowed fields
      });

      const updateData = mockPrisma.invoice.update.firstCall.args[0].data;
      assert.strictEqual(updateData.notes, 'New notes');
      assert.strictEqual(updateData.amount, undefined);
    });

    it('should set paidAt when marking invoice as paid', async () => {
      mockPrisma.invoice.findFirst.resolves({
        id: 'inv-1',
        userId: 'user-1',
        status: 'ISSUED',
      });
      mockPrisma.invoice.update.resolves({});

      await invoiceService.updateInvoice('user-1', 'inv-1', { status: 'PAID' });

      const updateData = mockPrisma.invoice.update.firstCall.args[0].data;
      assert.strictEqual(updateData.status, 'PAID');
      assert(updateData.paidAt instanceof Date);
    });
  });

  describe('markInvoicePaid', () => {
    it('should throw if invoice not found', async () => {
      mockPrisma.invoice.findFirst.resolves(null);

      await assert.rejects(
        () => invoiceService.markInvoicePaid('user-1', 'inv-nonexistent'),
        /Invoice not found/,
      );
    });

    it('should throw if invoice is already paid', async () => {
      mockPrisma.invoice.findFirst.resolves({
        id: 'inv-1',
        userId: 'user-1',
        status: 'PAID',
      });

      await assert.rejects(
        () => invoiceService.markInvoicePaid('user-1', 'inv-1'),
        /Invoice is already paid/,
      );
    });

    it('should mark invoice as paid with paymentId', async () => {
      mockPrisma.invoice.findFirst.resolves({
        id: 'inv-1',
        userId: 'user-1',
        status: 'ISSUED',
      });
      mockPrisma.invoice.update.resolves({ id: 'inv-1', status: 'PAID', paidAt: new Date() });

      const result = await invoiceService.markInvoicePaid('user-1', 'inv-1', 'pay-1');

      const updateData = mockPrisma.invoice.update.firstCall.args[0].data;
      assert.strictEqual(updateData.status, 'PAID');
      assert.strictEqual(updateData.paymentId, 'pay-1');
    });
  });

  describe('cancelInvoice', () => {
    it('should throw if invoice not found', async () => {
      mockPrisma.invoice.findFirst.resolves(null);

      await assert.rejects(
        () => invoiceService.cancelInvoice('user-1', 'inv-nonexistent'),
        /Invoice not found/,
      );
    });

    it('should throw if invoice is already paid', async () => {
      mockPrisma.invoice.findFirst.resolves({
        id: 'inv-1',
        userId: 'user-1',
        status: 'PAID',
      });

      await assert.rejects(
        () => invoiceService.cancelInvoice('user-1', 'inv-1'),
        /Cannot cancel a paid invoice/,
      );
    });

    it('should cancel invoice successfully', async () => {
      mockPrisma.invoice.findFirst.resolves({
        id: 'inv-1',
        userId: 'user-1',
        status: 'ISSUED',
      });
      mockPrisma.invoice.update.resolves({ id: 'inv-1', status: 'CANCELLED' });

      const result = await invoiceService.cancelInvoice('user-1', 'inv-1');

      assert.strictEqual(result.status, 'CANCELLED');
    });
  });

  describe('getInvoiceStats', () => {
    it('should return invoice statistics', async () => {
      mockPrisma.invoice.count.resolves(5);
      mockPrisma.invoice.aggregate.onFirstCall().resolves({ _sum: { total: 50000 } }); // paid
      mockPrisma.invoice.aggregate.onSecondCall().resolves({ _sum: { total: 20000 } }); // outstanding
      mockPrisma.invoice.count.onCall(1).resolves(2); // overdue

      const result = await invoiceService.getInvoiceStats('user-1');

      assert.strictEqual(result.totalInvoices, 5);
      assert.strictEqual(result.totalPaid, 50000);
      assert.strictEqual(result.totalOutstanding, 20000);
      assert.strictEqual(result.overdueCount, 2);
    });
  });

  describe('markOverdueInvoices', () => {
    it('should update overdue invoices', async () => {
      mockPrisma.invoice.updateMany.resolves({ count: 3 });

      const result = await invoiceService.markOverdueInvoices();

      assert.strictEqual(result, 3);
    });
  });
});
