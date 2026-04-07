import { Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const userValidators = {
  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
};

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
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
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const { firstName, lastName, walletAddress } = req.body;

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: { firstName, lastName, walletAddress },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      walletAddress: true,
      role: true,
      updatedAt: true,
    },
  });

  res.json({ user });
}

export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.userId! },
    data: { passwordHash },
  });

  res.json({ message: 'Password updated successfully' });
}
