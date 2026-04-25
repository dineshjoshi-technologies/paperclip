import { Response } from 'express';
import { body, query } from 'express-validator';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const BUYBACK_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'] as const;

export const buybackValidators = {
  create: [
    body('amountSSC').isFloat({ gt: 0 }).withMessage('amountSSC must be greater than 0'),
    body('rate').isFloat({ gt: 0 }).withMessage('rate must be greater than 0'),
  ],
  list: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(BUYBACK_STATUSES),
  ],
};

export async function createBuybackRequest(req: AuthRequest, res: Response) {
  const { amountSSC, rate } = req.body;
  const userId = req.userId!;
  const amount = String(amountSSC);
  const requestedUSDT = String(Number(amountSSC) * Number(rate));

  const buybackRequest = await prisma.buybackRequest.create({
    data: {
      userId,
      amountSSC: amount,
      requestedUSDT,
      rate: String(rate),
      status: 'PENDING',
    },
  });

  res.status(201).json({ buybackRequest });
}

export async function getUserBuybackRequests(req: AuthRequest, res: Response) {
  const { page = '1', limit = '20', status } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = { userId: req.userId! };
  if (status) where.status = status;

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
