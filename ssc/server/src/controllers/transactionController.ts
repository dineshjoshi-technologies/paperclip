import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { setCache, getCache } from '../config/redis';

export async function createTransaction(req: AuthRequest, res: Response) {
  const { type, amountSSC, amountUSDT, rate, txHash, blockNumber, metadata } = req.body;
  const userId = req.userId!;

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type,
      amountSSC: String(amountSSC),
      amountUSDT: amountUSDT ? String(amountUSDT) : undefined,
      rate: rate ? String(rate) : undefined,
      txHash,
      blockNumber,
      metadata,
    },
  });

  res.status(201).json({ transaction });
}

export async function getUserTransactions(req: AuthRequest, res: Response) {
  const { page = '1', limit = '20', status, type } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const userId = req.userId!;
  const cacheKey = `transactions:user:${userId}:page:${pageNum}:limit:${limitNum}:status:${status || 'all'}:type:${type || 'all'}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch {
    // Redis unavailable, continue without cache
  }

  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;
  if (type) where.type = type;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where }),
  ]);

  const response = {
    transactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    },
  };

  try {
    await setCache(cacheKey, JSON.stringify(response), 60);
  } catch {
    // Redis unavailable, continue without caching
  }

  res.json(response);
}

export async function getTransaction(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: req.userId! },
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  res.json({ transaction });
}
