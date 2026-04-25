import { Response } from 'express';
import { body, param, query } from 'express-validator';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const DISTRIBUTION_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;

export const profitValidators = {
  create: [
    body('distributionPeriod').isString().trim().isLength({ min: 1, max: 100 }),
    body('totalAmount').isFloat({ gt: 0 }).withMessage('totalAmount must be greater than 0'),
    body('snapshotDate').isISO8601(),
    body('recipients').optional().isArray(),
    body('recipients.*.userId').optional().isUUID(),
    body('recipients.*.tokenAmount').optional().isFloat({ gt: 0 }),
  ],
  list: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(DISTRIBUTION_STATUSES),
    query('period').optional().isString().trim().isLength({ min: 1, max: 100 }),
  ],
  getOne: [
    param('id').isUUID(),
  ],
  update: [
    param('id').isUUID(),
    body('status').optional().isIn(DISTRIBUTION_STATUSES),
    body('notes').optional().isString().trim().isLength({ max: 1000 }),
  ],
  execute: [
    param('id').isUUID(),
  ],
};

export async function createProfitDistribution(req: AuthRequest, res: Response) {
  const { distributionPeriod, totalAmount, snapshotDate, recipients } = req.body;

  const perTokenAmount = recipients && recipients.length > 0
    ? totalAmount / recipients.reduce((sum: number, r: any) => sum + Number(r.tokenAmount), 0)
    : 0;

  const distribution = await prisma.$transaction(async (tx) => {
    const dist = await tx.profitDistribution.create({
      data: {
        distributionPeriod,
        totalAmount,
        perTokenAmount,
        snapshotDate: new Date(snapshotDate),
        createdBy: req.userId!,
        status: 'PENDING',
      },
    });

    if (recipients && recipients.length > 0) {
      await tx.profitDistributionRecipient.createMany({
        data: recipients.map((r: any) => ({
          distributionId: dist.id,
          userId: r.userId,
          tokenAmount: r.tokenAmount,
          distributionAmount: Number(r.tokenAmount) * perTokenAmount,
          status: 'PENDING',
        })),
      });
    }

    return tx.profitDistribution.findUnique({
      where: { id: dist.id },
      include: { recipients: true },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.userId!,
      action: 'PROFIT_DISTRIBUTION_CREATED',
      entityType: 'ProfitDistribution',
      entityId: distribution!.id,
      details: { period: distributionPeriod, total: totalAmount },
    },
  });

  res.status(201).json({ distribution });
}

export async function getProfitDistributions(req: AuthRequest, res: Response) {
  const { page = '1', limit = '20', status, period } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (period) where.distributionPeriod = period;

  const [distributions, total] = await Promise.all([
    prisma.profitDistribution.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { recipients: true } } },
    }),
    prisma.profitDistribution.count({ where }),
  ]);

  res.json({
    distributions,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
}

export async function getProfitDistribution(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const distribution = await prisma.profitDistribution.findUnique({
    where: { id },
    include: { recipients: { include: { user: { select: { id: true, email: true, walletAddress: true } } } } },
  });

  if (!distribution) {
    return res.status(404).json({ error: 'Distribution not found' });
  }

  res.json({ distribution });
}

export async function updateProfitDistribution(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status, notes } = req.body;

  const existing = await prisma.profitDistribution.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Distribution not found' });
  }

  const distribution = await prisma.profitDistribution.update({
    where: { id },
    data: { status },
    include: { recipients: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.userId!,
      action: 'PROFIT_DISTRIBUTION_UPDATED',
      entityType: 'ProfitDistribution',
      entityId: id,
      details: { status, previousStatus: existing.status },
    },
  });

  res.json({ distribution });
}

export async function executeProfitDistribution(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const distribution = await prisma.profitDistribution.findUnique({
    where: { id },
    include: { recipients: true },
  });

  if (!distribution) {
    return res.status(404).json({ error: 'Distribution not found' });
  }

  if (distribution.status !== 'PENDING') {
    return res.status(400).json({ error: `Distribution is not pending: ${distribution.status}` });
  }

  const result = await prisma.$transaction(async (tx) => {
    const dist = await tx.profitDistribution.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    await tx.profitDistributionRecipient.updateMany({
      where: { distributionId: id },
      data: { status: 'COMPLETED' },
    });

    const recipients = await tx.profitDistributionRecipient.findMany({
      where: { distributionId: id },
    });

    for (const recipient of recipients) {
      await tx.transaction.create({
        data: {
          userId: recipient.userId,
          type: 'PROFIT_DISTRIBUTION',
          amountSSC: recipient.distributionAmount.toString(),
          rate: distribution.perTokenAmount.toString(),
          status: 'COMPLETED',
          metadata: {
            distributionId: id,
            period: distribution.distributionPeriod,
          },
        },
      });
    }

    return tx.profitDistribution.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.userId!,
      action: 'PROFIT_DISTRIBUTION_EXECUTED',
      entityType: 'ProfitDistribution',
      entityId: id,
      details: { period: distribution.distributionPeriod },
    },
  });

  res.json({ distribution: result });
}
