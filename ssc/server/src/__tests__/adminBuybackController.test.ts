const mockPrisma: any = {
  buybackRequest: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
};

jest.mock('../config/database', () => ({ prisma: mockPrisma }));

import {
  approveBuybackRequest,
  rejectBuybackRequest,
  processBuybackRequest,
  getAdminBuybackRequests,
} from '../controllers/adminBuybackController';

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;
}

describe('adminBuybackController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 when approving non-existent request', async () => {
    mockPrisma.buybackRequest.findUnique.mockResolvedValue(null);
    const req: any = { params: { id: 'req-1' }, body: {}, userId: 'admin-1' };
    const res = createRes();

    await approveBuybackRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Buyback request not found' });
  });

  it('returns 400 when approving non-pending request', async () => {
    mockPrisma.buybackRequest.findUnique.mockResolvedValue({ id: 'req-1', status: 'APPROVED' });
    const req: any = { params: { id: 'req-1' }, body: {}, userId: 'admin-1' };
    const res = createRes();

    await approveBuybackRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot approve request with status: APPROVED' });
  });

  it('approves pending request and writes audit log', async () => {
    mockPrisma.buybackRequest.findUnique.mockResolvedValue({ id: 'req-1', status: 'PENDING' });
    mockPrisma.buybackRequest.update.mockResolvedValue({ id: 'req-1', status: 'APPROVED' });
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    const req: any = { params: { id: 'req-1' }, body: { notes: 'approved' }, userId: 'admin-1' };
    const res = createRes();

    await approveBuybackRequest(req, res);

    expect(mockPrisma.buybackRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'req-1' }, data: expect.objectContaining({ status: 'APPROVED', notes: 'approved' }) }),
    );
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ buybackRequest: { id: 'req-1', status: 'APPROVED' } });
  });

  it('rejects pending request and sets default rejection note', async () => {
    mockPrisma.buybackRequest.findUnique.mockResolvedValue({ id: 'req-2', status: 'PENDING' });
    mockPrisma.buybackRequest.update.mockResolvedValue({ id: 'req-2', status: 'REJECTED' });

    const req: any = { params: { id: 'req-2' }, body: {}, userId: 'admin-1' };
    const res = createRes();

    await rejectBuybackRequest(req, res);

    expect(mockPrisma.buybackRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'REJECTED', notes: 'Rejected by admin' }) }),
    );
    expect(res.json).toHaveBeenCalledWith({ buybackRequest: { id: 'req-2', status: 'REJECTED' } });
  });

  it('returns 400 when processing request that is not approved', async () => {
    mockPrisma.buybackRequest.findUnique.mockResolvedValue({ id: 'req-3', status: 'PENDING' });

    const req: any = { params: { id: 'req-3' }, body: { txHash: '0xabc' }, userId: 'admin-1' };
    const res = createRes();

    await processBuybackRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot process request with status: PENDING' });
  });

  it('processes approved request and creates transaction', async () => {
    mockPrisma.buybackRequest.findUnique.mockResolvedValue({
      id: 'req-4',
      status: 'APPROVED',
      userId: 'user-1',
      amountSSC: 100,
      requestedUSDT: 25,
      rate: 0.25,
      processedAt: null,
    });
    mockPrisma.buybackRequest.update.mockResolvedValue({ id: 'req-4', status: 'COMPLETED', txHash: '0xabc' });
    mockPrisma.transaction.create.mockResolvedValue({ id: 'txn-1' });
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    const req: any = { params: { id: 'req-4' }, body: { txHash: '0xabc' }, userId: 'admin-1' };
    const res = createRes();

    await processBuybackRequest(req, res);

    expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', txHash: '0xabc', type: 'BUYBACK' }) }),
    );
    expect(res.json).toHaveBeenCalledWith({ buybackRequest: { id: 'req-4', status: 'COMPLETED', txHash: '0xabc' } });
  });

  it('lists buyback requests with clamped limit and filters', async () => {
    mockPrisma.buybackRequest.findMany.mockResolvedValue([{ id: 'req-5' }]);
    mockPrisma.buybackRequest.count.mockResolvedValue(1);

    const req: any = { query: { page: '2', limit: '500', status: 'PENDING', userId: 'user-9' } };
    const res = createRes();

    await getAdminBuybackRequests(req, res);

    expect(mockPrisma.buybackRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'PENDING', userId: 'user-9' }, take: 100, skip: 100 }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        buybackRequests: [{ id: 'req-5' }],
        pagination: expect.objectContaining({ page: 2, limit: 100, total: 1, totalPages: 1 }),
      }),
    );
  });
});
