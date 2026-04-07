const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Invoice Controller', () => {
  let invoiceController;
  let mockInvoiceService;
  let mockPrisma;

  const createMockReq = (body = {}, params = {}, query = {}, user = {}) => ({
    body, params, query, user,
  });

  const createMockRes = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
  });

  beforeEach(() => {
    sinon.reset();

    Object.keys(require.cache).forEach((key) => {
      if (key.includes('invoiceController')) {
        delete require.cache[key];
      }
    });

    mockInvoiceService = {
      createInvoice: sinon.stub(),
      getInvoice: sinon.stub(),
      getInvoicesByUser: sinon.stub(),
      updateInvoice: sinon.stub(),
      markInvoicePaid: sinon.stub(),
      cancelInvoice: sinon.stub(),
      getInvoiceStats: sinon.stub(),
      markOverdueInvoices: sinon.stub(),
    };

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

    invoiceController = proxyquire('../../src/controllers/invoice/invoiceController', {
      '../../services/invoiceService': mockInvoiceService,
      '../../config/prisma': mockPrisma,
    });
  });

  describe('createInvoice', () => {
    it('should return 400 if amount is missing', async () => {
      const req = createMockReq({}, {}, {}, { userId: 'user-1' });
      const res = createMockRes();

      await invoiceController.createInvoice(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should return 400 if amount is negative', async () => {
      const req = createMockReq({ amount: -100 }, {}, {}, { userId: 'user-1' });
      const res = createMockRes();

      await invoiceController.createInvoice(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should create invoice successfully', async () => {
      const req = createMockReq({ amount: 10000, tax: 1800 }, {}, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.createInvoice.resolves({
        id: 'inv-1',
        invoiceNumber: 'INV-202604-000001',
        amount: 10000,
        status: 'DRAFT',
      });

      await invoiceController.createInvoice(req, res);

      assert(mockInvoiceService.createInvoice.calledOnce);
      assert(res.status.calledOnceWith(201));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: sinon.match({ id: 'inv-1' }),
      }));
    });

    it('should handle service errors', async () => {
      const req = createMockReq({ amount: 10000 }, {}, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.createInvoice.rejects(new Error('DB error'));

      await invoiceController.createInvoice(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('getInvoice', () => {
    it('should return 404 if invoice not found', async () => {
      const req = createMockReq({}, { invoiceId: 'inv-nonexistent' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.getInvoice.resolves(null);

      await invoiceController.getInvoice(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return invoice successfully', async () => {
      const req = createMockReq({}, { invoiceId: 'inv-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.getInvoice.resolves({
        id: 'inv-1',
        invoiceNumber: 'INV-202604-000001',
        amount: 10000,
      });

      await invoiceController.getInvoice(req, res);

      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: sinon.match({ id: 'inv-1' }),
      }));
    });
  });

  describe('getInvoices', () => {
    it('should return paginated invoices', async () => {
      const req = createMockReq({}, {}, { page: '1', limit: '10' }, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.getInvoicesByUser.resolves({
        invoices: [{ id: 'inv-1', amount: 10000 }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      await invoiceController.getInvoices(req, res);

      assert(mockInvoiceService.getInvoicesByUser.calledOnceWith('user-1', {
        status: undefined,
        page: 1,
        limit: 10,
        orderBy: 'createdAt',
        orderDir: 'desc',
      }));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: sinon.match.array,
        pagination: sinon.match.object,
      }));
    });

    it('should filter by status', async () => {
      const req = createMockReq({}, {}, { status: 'PAID' }, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.getInvoicesByUser.resolves({
        invoices: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      await invoiceController.getInvoices(req, res);

      const callArgs = mockInvoiceService.getInvoicesByUser.firstCall.args[1];
      assert.strictEqual(callArgs.status, 'PAID');
    });
  });

  describe('updateInvoice', () => {
    it('should return 404 if invoice not found', async () => {
      const req = createMockReq({ notes: 'updated' }, { invoiceId: 'inv-nonexistent' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.updateInvoice.rejects(new Error('Invoice not found'));

      await invoiceController.updateInvoice(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should update invoice successfully', async () => {
      const req = createMockReq({ notes: 'updated notes' }, { invoiceId: 'inv-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.updateInvoice.resolves({ id: 'inv-1', notes: 'updated notes' });

      await invoiceController.updateInvoice(req, res);

      assert(mockInvoiceService.updateInvoice.calledOnce);
      assert(res.status.calledOnceWith(200));
    });
  });

  describe('markPaid', () => {
    it('should return 404 if invoice not found', async () => {
      const req = createMockReq({}, { invoiceId: 'inv-nonexistent' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.markInvoicePaid.rejects(new Error('Invoice not found'));

      await invoiceController.markPaid(req, res);

      assert(res.status.calledOnceWith(404));
    });

    it('should return 400 if invoice already paid', async () => {
      const req = createMockReq({ paymentId: 'pay-1' }, { invoiceId: 'inv-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.markInvoicePaid.rejects(new Error('Invoice is already paid'));

      await invoiceController.markPaid(req, res);

      assert(res.status.calledOnceWith(400));
    });

    it('should mark invoice as paid successfully', async () => {
      const req = createMockReq({ paymentId: 'pay-1' }, { invoiceId: 'inv-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.markInvoicePaid.resolves({ id: 'inv-1', status: 'PAID', paidAt: new Date() });

      await invoiceController.markPaid(req, res);

      assert(mockInvoiceService.markInvoicePaid.calledOnceWith('user-1', 'inv-1', 'pay-1'));
      assert(res.status.calledOnceWith(200));
    });
  });

  describe('cancelInvoice', () => {
    it('should return 404 if invoice not found', async () => {
      const req = createMockReq({}, { invoiceId: 'inv-nonexistent' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.cancelInvoice.rejects(new Error('Invoice not found'));

      await invoiceController.cancelInvoice(req, res);

      assert(res.status.calledOnceWith(404));
    });

    it('should return 400 if trying to cancel paid invoice', async () => {
      const req = createMockReq({}, { invoiceId: 'inv-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.cancelInvoice.rejects(new Error('Cannot cancel a paid invoice'));

      await invoiceController.cancelInvoice(req, res);

      assert(res.status.calledOnceWith(400));
    });

    it('should cancel invoice successfully', async () => {
      const req = createMockReq({}, { invoiceId: 'inv-1' }, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.cancelInvoice.resolves({ id: 'inv-1', status: 'CANCELLED' });

      await invoiceController.cancelInvoice(req, res);

      assert(mockInvoiceService.cancelInvoice.calledOnce);
      assert(res.status.calledOnceWith(200));
    });
  });

  describe('getStats', () => {
    it('should return invoice statistics', async () => {
      const req = createMockReq({}, {}, {}, { userId: 'user-1' });
      const res = createMockRes();
      mockInvoiceService.getInvoiceStats.resolves({
        totalInvoices: 10,
        totalPaid: 50000,
        totalOutstanding: 25000,
        overdueCount: 2,
      });

      await invoiceController.getStats(req, res);

      assert(mockInvoiceService.getInvoiceStats.calledOnceWith('user-1'));
      assert(res.status.calledOnceWith(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: sinon.match({
          totalInvoices: 10,
          totalPaid: 50000,
          totalOutstanding: 25000,
          overdueCount: 2,
        }),
      }));
    });
  });
});
