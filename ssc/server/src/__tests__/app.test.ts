const mockPrisma: any = {
  user: {},
  refreshToken: {},
  transaction: {},
  buybackRequest: {},
  profitDistribution: {},
  profitDistributionRecipient: {},
  auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1', action: 'TEST', actorId: 'user-1' }) },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn((fn: any) => fn(mockPrisma)),
};

jest.mock('../config/database', () => ({ prisma: mockPrisma }));

jest.mock('../config/redis', () => {
  const redisClient = {
    ping: jest.fn().mockResolvedValue('PONG'),
    set: jest.fn(),
    setex: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    on: jest.fn(),
  };
  return {
    redis: redisClient,
    setCache: jest.fn(),
    getCache: jest.fn(),
    deleteCache: jest.fn(),
    invalidatePattern: jest.fn(),
  };
});

jest.mock('../utils/jwt', () => ({
  generateAccessToken: jest.fn((userId: string, _role: string) => `mock-access-${userId}`),
  generateRefreshToken: jest.fn((userId: string, _role: string) => `mock-refresh-${userId}`),
  verifyRefreshToken: jest.fn((token: string) => {
    if (token === 'invalid-token') throw new Error('Invalid');
    return { userId: 'user-1', role: 'USER' };
  }),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token: string, secret: string) => {
    if (token === 'invalid-token') throw new Error('Invalid');
    return { userId: 'user-1', role: 'USER' };
  }),
  sign: jest.fn(() => 'mock-token'),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn((password: string, hash: string) => Promise.resolve(password === 'correct-password' || password === 'secure123')),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Auth Controller', () => {
  describe('register', () => {
    it('creates user and returns tokens', async () => {
      const { register } = await import('../controllers/authController');
      const req: any = { body: { email: 'test@example.com', password: 'secure123', firstName: 'Test' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.user.findFirst = jest.fn().mockResolvedValue(null);
      mockPrisma.user.create = jest.fn().mockResolvedValue({
        id: 'user-1', email: 'test@example.com', firstName: 'Test', role: 'USER',
      });
      mockPrisma.refreshToken.create = jest.fn().mockResolvedValue({ id: 'rt-1' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'mock-access-user-1',
          refreshToken: 'mock-refresh-user-1',
        }),
      );
    });

    it('returns 409 for duplicate email', async () => {
      jest.resetModules();
      const { register } = await import('../controllers/authController');
      const req: any = { body: { email: 'existing@example.com', password: 'secure123' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.user.findFirst = jest.fn().mockResolvedValue({ id: 'user-2' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });
  });

  describe('login', () => {
    it('returns 401 for invalid credentials', async () => {
      jest.resetModules();
      const { login } = await import('../controllers/authController');
      const req: any = { body: { email: 'test@example.com', password: 'wrong' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('returns 403 for disabled account', async () => {
      jest.resetModules();
      const { login } = await import('../controllers/authController');
      const req: any = { body: { email: 'test@example.com', password: 'correct-password' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'user-1', email: 'test@example.com', passwordHash: 'hashed-password', isActive: false,
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Account is disabled' });
    });

    it('returns tokens for valid login', async () => {
      jest.resetModules();
      const { login } = await import('../controllers/authController');
      const req: any = { body: { email: 'test@example.com', password: 'correct-password' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        walletAddress: null,
        role: 'USER',
        isActive: true,
      });
      mockPrisma.refreshToken.create = jest.fn().mockResolvedValue({ id: 'rt-1' });

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'mock-access-user-1',
          refreshToken: 'mock-refresh-user-1',
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('rotates tokens when valid', async () => {
      jest.resetModules();
      const { refreshTokens } = await import('../controllers/authController');
      const req: any = { body: { refreshToken: 'valid-refresh-token' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.refreshToken.findFirst = jest.fn().mockResolvedValue({
        id: 'rt-1', token: 'valid-refresh-token', revoked: false,
        expiresAt: new Date(Date.now() + 3600000),
      });
      mockPrisma.refreshToken.update = jest.fn().mockResolvedValue({});
      mockPrisma.refreshToken.create = jest.fn().mockResolvedValue({});

      await refreshTokens(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'mock-access-user-1',
          refreshToken: 'mock-refresh-user-1',
        }),
      );
    });

    it('returns 401 for invalid token', async () => {
      jest.resetModules();
      const { refreshTokens } = await import('../controllers/authController');
      const req: any = { body: { refreshToken: 'invalid-token' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const { verifyRefreshToken } = await import('../utils/jwt');
      (verifyRefreshToken as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid');
      });

      await refreshTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('revokes refresh tokens', async () => {
      jest.resetModules();
      const { logout } = await import('../controllers/authController');
      const req: any = { body: { refreshToken: 'some-refresh-token' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.refreshToken.updateMany = jest.fn().mockResolvedValue({ count: 1 });

      await logout(req, res);

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: 'some-refresh-token' },
        data: { revoked: true },
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});

describe('User Controller', () => {
  describe('getProfile', () => {
    it('returns user profile', async () => {
      jest.resetModules();
      const { getProfile } = await import('../controllers/userController');
      const req: any = { userId: 'user-1' };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'user-1', email: 'test@example.com', firstName: 'Test', role: 'USER', isActive: true,
      });

      await getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        user: expect.objectContaining({ id: 'user-1' }),
      }));
    });
  });

  describe('updateProfile', () => {
    it('updates profile fields', async () => {
      jest.resetModules();
      const { updateProfile } = await import('../controllers/userController');
      const req: any = { userId: 'user-1', body: { firstName: 'Updated', lastName: 'Name' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.user.update = jest.fn().mockResolvedValue({
        id: 'user-1', email: 'test@example.com', firstName: 'Updated', lastName: 'Name',
      });

      await updateProfile(req, res);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-1' },
        data: { firstName: 'Updated', lastName: 'Name' },
      }));
    });
  });

  describe('changePassword', () => {
    it('returns 401 for wrong current password', async () => {
      jest.resetModules();
      const { changePassword } = await import('../controllers/userController');
      const req: any = { userId: 'user-1', body: { currentPassword: 'wrong', newPassword: 'newpassword' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'user-1', passwordHash: 'old-hash',
      });

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });
  });
});

describe('Transaction Controller', () => {
  describe('createTransaction', () => {
    it('creates a new transaction', async () => {
      jest.resetModules();
      const { createTransaction } = await import('../controllers/transactionController');
      const req: any = {
        userId: 'user-1',
        body: { type: 'BUY', amountSSC: 100, amountUSDT: 10, rate: 0.1 },
      };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.transaction.create = jest.fn().mockResolvedValue({
        id: 'tx-1', userId: 'user-1', type: 'BUY', amountSSC: '100',
      });

      await createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });
  });

  describe('getUserTransactions', () => {
    it('returns paginated transactions', async () => {
      jest.resetModules();
      const { getUserTransactions } = await import('../controllers/transactionController');
      const req: any = { userId: 'user-1', query: { page: '1', limit: '20' } };
      const res: any = { json: jest.fn() };

      mockPrisma.transaction.findMany = jest.fn().mockResolvedValue([{ id: 'tx-1' }]);
      mockPrisma.transaction.count = jest.fn().mockResolvedValue(1);

      await getUserTransactions(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          transactions: expect.any(Array),
          pagination: expect.objectContaining({ page: 1, total: 1 }),
        }),
      );
    });
  });

  describe('getTransaction', () => {
    it('returns 404 for non-owned transaction', async () => {
      jest.resetModules();
      const { getTransaction } = await import('../controllers/transactionController');
      const req: any = { userId: 'user-1', params: { id: 'tx-999' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.transaction.findFirst = jest.fn().mockResolvedValue(null);

      await getTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Transaction not found' });
    });
  });
});

describe('Buyback Controller', () => {
  describe('createBuybackRequest', () => {
    it('creates a buyback request', async () => {
      jest.resetModules();
      const { createBuybackRequest } = await import('../controllers/buybackController');
      const req: any = { userId: 'user-1', body: { amountSSC: 500, rate: 0.1 } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockPrisma.buybackRequest.create = jest.fn().mockResolvedValue({
        id: 'bb-1', userId: 'user-1', amountSSC: '500', requestedUSDT: '50', status: 'PENDING',
      });

      await createBuybackRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockPrisma.buybackRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });
  });
});

describe('Admin Controller', () => {
  describe('getUsers', () => {
    it('returns paginated user list', async () => {
      jest.resetModules();
      const { getUsers } = await import('../controllers/adminController');
      const req: any = { query: { page: '1', limit: '10' } };
      const res: any = { json: jest.fn() };

      mockPrisma.user.findMany = jest.fn().mockResolvedValue([]);
      mockPrisma.user.count = jest.fn().mockResolvedValue(0);

      await getUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ users: [], pagination: expect.any(Object) }),
      );
    });

    it('supports search filtering', async () => {
      jest.resetModules();
      const { getUsers } = await import('../controllers/adminController');
      const req: any = { query: { page: '1', limit: '10', search: 'test' } };
      const res: any = { json: jest.fn() };

      mockPrisma.user.findMany = jest.fn().mockResolvedValue([]);
      mockPrisma.user.count = jest.fn().mockResolvedValue(0);

      await getUsers(req, res);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('updateUser', () => {
    it('updates user role and status', async () => {
      jest.resetModules();
      const { updateUser } = await import('../controllers/adminController');
      const req: any = {
        params: { userId: 'user-2' },
        body: { role: 'ADMIN', isActive: false },
      };
      const res: any = { json: jest.fn() };

      mockPrisma.user.update = jest.fn().mockResolvedValue({
        id: 'user-2', role: 'ADMIN', isActive: false,
      });

      await updateUser(req, res);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-2' },
          data: { role: 'ADMIN', isActive: false },
        }),
      );
    });
  });

  describe('getStats', () => {
    it('returns platform statistics', async () => {
      jest.resetModules();
      const { getStats } = await import('../controllers/adminController');
      const req: any = {};
      const res: any = { json: jest.fn() };

      mockPrisma.user.count = jest.fn()
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85);
      mockPrisma.transaction.count = jest.fn().mockResolvedValue(500);
      mockPrisma.transaction.aggregate = jest.fn().mockResolvedValue({ _sum: { amountSSC: null } });
      mockPrisma.buybackRequest.count = jest.fn()
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(20);

      await getStats(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.objectContaining({
            totalUsers: 100,
            activeUsers: 85,
            totalTransactions: 500,
          }),
        }),
      );
    });
  });
});

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('sets req.userId on valid token', async () => {
      jest.resetModules();
      const { authenticate } = await import('../middleware/auth');
      const req: any = { headers: { authorization: 'Bearer valid-token' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'user-1', isActive: true,
      });

      await authenticate(req, res, next);

      expect(req.userId).toBe('user-1');
      expect(next).toHaveBeenCalled();
    });

    it('returns 401 without authorization header', async () => {
      jest.resetModules();
      const { authenticate } = await import('../middleware/auth');
      const req: any = { headers: {} };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('allows authorized roles', async () => {
      jest.resetModules();
      const { authorize } = await import('../middleware/auth');
      const req: any = { userRole: 'ADMIN' };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = authorize('ADMIN', 'SUPER_ADMIN');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('blocks unauthorized roles', async () => {
      jest.resetModules();
      const { authorize } = await import('../middleware/auth');
      const req: any = { userRole: 'USER' };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = authorize('ADMIN', 'SUPER_ADMIN');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
