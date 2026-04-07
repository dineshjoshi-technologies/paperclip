import { Response } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const buybackValidators = {
  approve: [
    param('id').isUUID(),
    body('notes').optional().isString().trim(),
  ],
  reject: [
    param('id').isUUID(),
    body('notes').optional().isString().trim(),
  ],
  process: [
    param('id').isUUID(),
    body('txHash').notEmpty().isString(),
  ],
};

export async function approveBuybackRequest(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { notes } = req.body;

  const existing = await prisma.buybackRequest.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Buyback request not found' });
  }

  if (existing.status !== 'PENDING') {
    return res.status(400).json({ error: `Cannot approve request with status: ${existing.status}` });
  }

  const buybackRequest = await prisma.buybackRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      processedAt: new Date(),
      processedBy: req.userId!,
      notes,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.userId!,
      action: 'BUYBACK_APPROVED',
      entityType: 'BuybackRequest',
      entityId: id,
      details: { notes },
    },
  });

  res.json({ buybackRequest });
}

export async function rejectBuybackRequest(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { notes } = req.body;

  const existing = await prisma.buybackRequest.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Buyback request not found' });
  }

  if (existing.status !== 'PENDING') {
    return res.status(400).json({ error: `Cannot reject request with status: ${existing.status}` });
  }

  const buybackRequest = await prisma.buybackRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      processedAt: new Date(),
      processedBy: req.userId!,
      notes: notes || 'Rejected by admin',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.userId!,
      action: 'BUYBACK_REJECTED',
      entityType: 'BuybackRequest',
      entityId: id,
      details: { notes },
    },
  });

  res.json({ buybackRequest });
}

export async function processBuybackRequest(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { txHash } = req.body;

  const existing = await prisma.buybackRequest.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Buyback request not found' });
  }

  if (existing.status !== 'APPROVED') {
    return res.status(400).json({ error: `Cannot process request with status: ${existing.status}` });
  }

  const buybackRequest = await prisma.buybackRequest.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      txHash,
      processedAt: existing.processedAt || new Date(),
      processedBy: req.userId!,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: existing.userId,
      type: 'BUYBACK',
      amountSSC: existing.amountSSC.toString(),
      amountUSDT: existing.requestedUSDT.toString(),
      rate: existing.rate.toString(),
      txHash,
      status: 'COMPLETED',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.userId!,
      action: 'BUYBACK_PROCESSED',
      entityType: 'BuybackRequest',
      entityId: id,
      details: { txHash },
    },
  });

  res.json({ buybackRequest });
}

export async function getAdminBuybackRequests(req: AuthRequest, res: Response) {
  const { page = '1', limit = '20', status, userId } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const [buybackRequests, total] = await Promise.all([
    prisma.buybackRequest.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.buybackRequest.count({ where }),
  ]);

  res.json({
    buybackRequests,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
}
