// Set environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';

// Manual mock for Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

// Set environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock modules
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake-reset-token'),
  verify: jest.fn().mockReturnValue({ userId: '1', email: 'test@example.com', purpose: 'password_reset' }),
}));

describe('Auth Controller', () => {
  let authController;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
    
    // Reload the controller to get fresh instance with mocked dependencies
    jest.isolateModules(() => {
      authController = require('../../src/controllers/auth/authController');
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      });

      await authController.register(req, res);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedPassword',
          name: 'Test User',
          role: 'USER',
        }
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
        })
      );
    });

    it('should return 400 if email or password missing', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          // password missing
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email and password are required',
        })
      );
    });

    it('should return 409 if user already exists', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing',
        email: 'test@example.com',
      }); // User exists

      await authController.register(req, res);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User with this email already exists',
        })
      );
      // Should not proceed to hashing or creating user
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      });

      await authController.login(req, res);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
        })
      );
    });

    it('should return 401 for invalid credentials', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(null); // User not found

      await authController.login(req, res);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials',
        })
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should return success message for existing email', async () => {
      const req = {
        body: {
          email: 'test@example.com',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      await authController.requestPasswordReset(req, res);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('reset link'),
        })
      );
    });

    it('should return success message for non-existing email (security)', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(null); // User not found

      await authController.requestPasswordReset(req, res);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('reset link'),
        })
      );
    });
  });
});