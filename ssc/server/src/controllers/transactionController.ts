import { Response } from 'express';
import { body, param, query } from 'express-validator';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { setCache, getCache } from '../config/redis';

const TRANSACTION_TYPES = ['BUY', 'SELL', 'BUYBACK', 'PROFIT_DISTRIBUTION', 'TRANSFER'] as const;
const TRANSACTION_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const;

export const transactionValidators = {
  create: [
    body('type').isIn(TRANSACTION_TYPES),
    body('amountSSC').isFloat({ gt: 0 }).withMessage('amountSSC must be greater than 0'),
    body('amountUSDT').optional().isFloat({ min: 0 }).withMessage('amountUSDT must be non-negative'),
    body('rate').optional().isFloat({ gt: 0 }).withMessage('rate must be greater than 0'),
    body('txHash').optional().isString().trim().isLength({ min: 1, max: 255 }),
    body('blockNumber').optional().isInt({ min: 0 }).toInt(),
    body('metadata').optional().isObject(),
  ],
  list: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(TRANSACTION_STATUSES),
    query('type').optional().isIn(TRANSACTION_TYPES),
  ],
  getOne: [
    param('id').isUUID(),
  ],
};

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
