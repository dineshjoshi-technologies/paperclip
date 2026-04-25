import { Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const userValidators = {
  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  updateProfile: [
    body('firstName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('lastName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('walletAddress').optional().trim().isEthereumAddress(),
    body().custom((value) => {
      if (!value || typeof value !== 'object') {
        throw new Error('Request body must be an object');
      }

      const hasAllowedField = ['firstName', 'lastName', 'walletAddress'].some(
        (field) => value[field] !== undefined,
      );

      if (!hasAllowedField) {
        throw new Error('At least one profile field must be provided');
      }

      return true;
    }),
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
