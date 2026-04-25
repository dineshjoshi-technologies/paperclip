const mockTx: any = {
  profitDistribution: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  profitDistributionRecipient: {
    createMany: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
  },
};

const mockPrisma: any = {
  profitDistribution: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  profitDistributionRecipient: {
    createMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn(async (fn: any) => fn(mockTx)),
};

jest.mock('../config/database', () => ({ prisma: mockPrisma }));

import {
  createProfitDistribution,
  getProfitDistributions,
  getProfitDistribution,
  updateProfitDistribution,
  executeProfitDistribution,
} from '../controllers/adminProfitController';

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;
}

describe('adminProfitController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates distribution with recipients and computed per-token amount', async () => {
    mockTx.profitDistribution.create.mockResolvedValue({ id: 'dist-1' });
    mockTx.profitDistribution.findUnique.mockResolvedValue({ id: 'dist-1', recipients: [{ userId: 'u1' }] });

    const req: any = {
      userId: 'admin-1',
      body: {
        distributionPeriod: '2026-Q1',
        totalAmount: 150,
        snapshotDate: '2026-01-01T00:00:00.000Z',
        recipients: [
          { userId: 'u1', tokenAmount: 100 },
          { userId: 'u2', tokenAmount: 50 },
        ],
      },
    };
    const res = createRes();

    await createProfitDistribution(req, res);

    expect(mockTx.profitDistribution.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ perTokenAmount: 1, status: 'PENDING' }) }),
    );
    expect(mockTx.profitDistributionRecipient.createMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.arrayContaining([expect.objectContaining({ userId: 'u1', distributionAmount: 100 })]) }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('creates distribution without recipients and skips createMany', async () => {
    mockTx.profitDistribution.create.mockResolvedValue({ id: 'dist-2' });
    mockTx.profitDistribution.findUnique.mockResolvedValue({ id: 'dist-2', recipients: [] });

    const req: any = {
      userId: 'admin-1',
      body: {
        distributionPeriod: '2026-Q2',
        totalAmount: 500,
        snapshotDate: '2026-04-01T00:00:00.000Z',
        recipients: [],
      },
    };
    const res = createRes();

    await createProfitDistribution(req, res);

    expect(mockTx.profitDistribution.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ perTokenAmount: 0 }) }),
    );
    expect(mockTx.profitDistributionRecipient.createMany).not.toHaveBeenCalled();
  });

  it('lists distributions with filters', async () => {
    mockPrisma.profitDistribution.findMany.mockResolvedValue([{ id: 'dist-3' }]);
    mockPrisma.profitDistribution.count.mockResolvedValue(1);

    const req: any = { query: { page: '2', limit: '50', status: 'PENDING', period: '2026-Q1' } };
    const res = createRes();

    await getProfitDistributions(req, res);

    expect(mockPrisma.profitDistribution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'PENDING', distributionPeriod: '2026-Q1' }, skip: 50, take: 50 }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ distributions: [{ id: 'dist-3' }] }));
  });

  it('returns 404 when fetching missing distribution', async () => {
    mockPrisma.profitDistribution.findUnique.mockResolvedValue(null);

    const req: any = { params: { id: 'dist-404' } };
    const res = createRes();

    await getProfitDistribution(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Distribution not found' });
  });

  it('returns 404 when updating missing distribution', async () => {
    mockPrisma.profitDistribution.findUnique.mockResolvedValue(null);

    const req: any = { params: { id: 'dist-404' }, body: { status: 'FAILED' }, userId: 'admin-1' };
    const res = createRes();

    await updateProfitDistribution(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Distribution not found' });
  });

  it('updates distribution and writes audit log', async () => {
    mockPrisma.profitDistribution.findUnique.mockResolvedValue({ id: 'dist-1', status: 'PENDING' });
    mockPrisma.profitDistribution.update.mockResolvedValue({ id: 'dist-1', status: 'COMPLETED', recipients: [] });

    const req: any = { params: { id: 'dist-1' }, body: { status: 'COMPLETED', notes: 'done' }, userId: 'admin-1' };
    const res = createRes();

    await updateProfitDistribution(req, res);

    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ distribution: { id: 'dist-1', status: 'COMPLETED', recipients: [] } });
  });

  it('returns 400 when executing non-pending distribution', async () => {
    mockPrisma.profitDistribution.findUnique.mockResolvedValue({ id: 'dist-7', status: 'COMPLETED', recipients: [] });

    const req: any = { params: { id: 'dist-7' }, userId: 'admin-1' };
    const res = createRes();

    await executeProfitDistribution(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Distribution is not pending: COMPLETED' });
  });

  it('executes pending distribution and creates payout transactions', async () => {
    mockPrisma.profitDistribution.findUnique.mockResolvedValue({
      id: 'dist-8',
      status: 'PENDING',
      perTokenAmount: 2,
      distributionPeriod: '2026-Q3',
      recipients: [{ userId: 'u1', distributionAmount: 20 }],
    });

    mockTx.profitDistribution.update
      .mockResolvedValueOnce({ id: 'dist-8', status: 'PROCESSING' })
      .mockResolvedValueOnce({ id: 'dist-8', status: 'COMPLETED' });
    mockTx.profitDistributionRecipient.findMany.mockResolvedValue([
      { userId: 'u1', distributionAmount: 20 },
      { userId: 'u2', distributionAmount: 30 },
    ]);

    const req: any = { params: { id: 'dist-8' }, userId: 'admin-1' };
    const res = createRes();

    await executeProfitDistribution(req, res);

    expect(mockTx.profitDistributionRecipient.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { distributionId: 'dist-8' }, data: { status: 'COMPLETED' } }),
    );
    expect(mockTx.transaction.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ distribution: { id: 'dist-8', status: 'COMPLETED' } });
  });
});
