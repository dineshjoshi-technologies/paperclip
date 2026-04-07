import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { setCache, getCache } from '../config/redis';

export async function getUsers(req: AuthRequest, res: Response) {
  const { page = '1', limit = '20', search, role } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const cacheKey = `admin:users:page:${pageNum}:limit:${limitNum}:search:${search || 'none'}:role:${role || 'all'}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch {
    // Redis unavailable, continue without cache
  }

  const where: Record<string, unknown> = {};
  if (role) where.role = role as UserRole;
  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        walletAddress: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const response = {
    users,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 0 },
  };

  try {
    await setCache(cacheKey, JSON.stringify(response), 60);
  } catch {
    // Redis unavailable, continue without caching
  }

  res.json(response);
}

export async function updateUser(req: AuthRequest, res: Response) {
  const { role, isActive } = req.body;

  const user = await prisma.user.update({
    where: { id: req.params.userId },
    data: { role: role as UserRole, isActive },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      walletAddress: true,
      role: true,
      isActive: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.userId!,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user.id,
      details: { role, isActive },
    },
  });

  res.json({ user });
}

export async function getStats(req: AuthRequest, res: Response) {
  const [
    totalUsers,
    activeUsers,
    totalTransactions,
    totalSSCIssued,
    pendingBuybacks,
    completedBuybacks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      where: { type: 'BUY' },
      _sum: { amountSSC: true },
    }),
    prisma.buybackRequest.count({ where: { status: 'PENDING' } }),
    prisma.buybackRequest.count({ where: { status: 'COMPLETED' } }),
  ]);

  res.json({
    stats: {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalSSCIssued: totalSSCIssued._sum.amountSSC?.toString() || '0',
      pendingBuybacks,
      completedBuybacks,
    },
  });
}
