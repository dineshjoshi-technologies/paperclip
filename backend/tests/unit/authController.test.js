// Import required modules
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');

// We'll use proxyquire to mock dependencies
const proxyquire = require('proxyquire');

// Mock request and response objects
const createMockReq = (body) => ({
  body
});

const createMockRes = () => {
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.stub()
  };
  return res;
};

describe('Auth Controller', () => {
  let authController;
  let req, res, next;
  let mockPrisma, mockBcrypt, mockJwt;
   
  beforeEach(() => {
    // Reset all mocks
    sinon.reset();
    
    // Mock environment variables
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Setup mocks
    mockPrisma = {
      user: {
        findUnique: sinon.stub(),
        create: sinon.stub()
      }
    };
    
    mockBcrypt = {
      genSalt: sinon.stub(),
      hash: sinon.stub(),
      compare: sinon.stub()
    };
    
    mockJwt = {
      sign: sinon.stub()
    };
    
    // Use proxyquire to load the module with mocked dependencies
    // We need to mock the exact requires used in the file
    authController = proxyquire('../../src/controllers/auth/authController', {
        '@prisma/client': { PrismaClient: function() { return mockPrisma; } },
        'bcryptjs': mockBcrypt,
        'jsonwebtoken': mockJwt
    });
    
    req = createMockReq({});
    res = createMockRes();
    next = sinon.stub();
  });
  
  afterEach(() => {
    // Clean up environment variables
    delete process.env.JWT_SECRET;
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      req.body = userData;
      
      mockPrisma.user.findUnique.resolves(null); // No existing user
      mockBcrypt.genSalt.resolves('salt');
      mockBcrypt.hash.resolves('hashedPassword');
      mockPrisma.user.create.resolves({
        id: 'user-id',
        email: userData.email,
        passwordHash: 'hashedPassword',
        name: userData.name,
        role: 'USER'
      });
      mockJwt.sign.resolves('fake-jwt-token');
      
      // Act
      await authController.register(req, res, next);
      
      // Assert
      assert(mockPrisma.user.findUnique.calledOnceWithExactly({
        where: { email: userData.email }
      }));
      assert(mockBcrypt.genSalt.calledOnceWithExactly(10));
      assert(mockBcrypt.hash.calledOnceWithExactly(userData.password, 'salt'));
      assert(mockPrisma.user.create.calledOnceWithExactly({
        data: {
          email: userData.email,
          passwordHash: 'hashedPassword',
          name: userData.name,
          role: 'USER'
        }
      }));
      assert(mockJwt.sign.calledOnceWithExactly(
        { userId: 'user-id', email: userData.email },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      ));
      assert(res.status.calledOnceWithExactly(201));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'User registered successfully'
      }));
    });
    
    it('should return 400 if email or password missing', async () => {
      // Arrange
      req.body = { email: 'test@example.com' }; // Missing password
      
      // Act
      await authController.register(req, res, next);
      
      // Assert
      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Email and password are required'
      }));
    });
    
    it('should return 409 if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      req.body = userData;
      
      mockPrisma.user.findUnique.resolves({ id: 'existing-user-id' }); // User exists
      
      // Act
      await authController.register(req, res, next);
      
      // Assert
      assert(mockPrisma.user.findUnique.calledOnceWithExactly({
        where: { email: userData.email }
      }));
      assert(res.status.calledOnceWithExactly(409));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'User with this email already exists'
      }));
      assert(mockBcrypt.genSalt.notCalled); // Should not proceed to hashing
    });
  });
  
  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      req.body = userData;
      
      mockPrisma.user.findUnique.resolves({
        id: 'user-id',
        email: userData.email,
        passwordHash: 'hashedPassword',
        name: 'Test User',
        role: 'USER'
      });
      mockBcrypt.compare.resolves(true); // Password matches
      mockJwt.sign.resolves('fake-jwt-token');
      
      // Act
      await authController.login(req, res, next);
      
      // Assert
      assert(mockPrisma.user.findUnique.calledOnceWithExactly({
        where: { email: userData.email }
      }));
      assert(mockBcrypt.compare.calledOnceWithExactly(userData.password, 'hashedPassword'));
      assert(mockJwt.sign.calledOnceWithExactly(
        { userId: 'user-id', email: userData.email },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      ));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'Login successful'
      }));
    });
    
    it('should return 401 for invalid credentials', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      mockPrisma.user.findUnique.resolves({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashedPassword'
      });
      mockBcrypt.compare.resolves(false); // Password doesn't match
      
      // Act
      await authController.login(req, res, next);
      
      // Assert
      assert(mockBcrypt.compare.calledOnceWithExactly('wrongpassword', 'hashedPassword'));
      assert(res.status.calledOnceWithExactly(401));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Invalid credentials'
      }));
      assert(mockJwt.sign.notCalled); // Should not generate token
    });
  });
  
  describe('requestPasswordReset', () => {
    it('should return 400 if email is missing', async () => {
      // Arrange
      req.body = {}; // Missing email
      
      // Act
      await authController.requestPasswordReset(req, res, next);
      
      // Assert
      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Email is required'
      }));
    });
    
    it('should return success message when email exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com'
      };
      req.body = userData;
      
      mockPrisma.user.findUnique.resolves({ id: 'user-id' }); // User exists
      
      // Act
      await authController.requestPasswordReset(req, res, next);
      
      // Assert
      assert(mockPrisma.user.findUnique.calledOnceWithExactly({
        where: { email: userData.email }
      }));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'If the email exists, you will receive a reset link'
      }));
    });
    
    it('should return success message when email does not exist (to prevent email enumeration)', async () => {
      // Arrange
      const userData = {
        email: 'nonexistent@example.com'
      };
      req.body = userData;
      
      mockPrisma.user.findUnique.resolves(null); // User does not exist
      
      // Act
      await authController.requestPasswordReset(req, res, next);
      
      // Assert
      assert(mockPrisma.user.findUnique.calledOnceWithExactly({
        where: { email: userData.email }
      }));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'If the email exists, you will receive a reset link'
      }));
    });
  });
  
  describe('resetPassword', () => {
    it('should return 400 if token or password is missing', async () => {
      // Arrange
      req.body = { token: 'valid-token' }; // Missing password
      
      // Act
      await authController.resetPassword(req, res, next);
      
      // Assert
      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Token and password are required'
      }));
    });
    
    it('should return success message (placeholder implementation)', async () => {
      // Arrange
      const resetData = {
        token: 'valid-token',
        password: 'newpassword123'
      };
      req.body = resetData;
      
      // Act
      await authController.resetPassword(req, res, next);
      
      // Assert
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'Password has been reset successfully'
      }));
    });
  });
  
  describe('getProfile', () => {
    it('should return user profile when authenticated', async () => {
      // Arrange
      const userData = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'avatar-url',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock the request with user info (as set by authenticate middleware)
      req.user = { userId: 'user-id', email: 'test@example.com' };
      
      mockPrisma.user.findUnique.resolves(userData);
      
      // Act
      await authController.getProfile(req, res, next);
      
      // Assert
      assert(mockPrisma.user.findUnique.calledOnceWithExactly({
        where: { id: 'user-id' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          role: userData.role,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        }
      }));
    });
    
    it('should return 404 if user not found', async () => {
      // Arrange
      req.user = { userId: 'nonexistent-id', email: 'nonexistent@example.com' };
      
      mockPrisma.user.findUnique.resolves(null); // User not found
      
      // Act
      await authController.getProfile(req, res, next);
      
      // Assert
      assert(mockPrisma.user.findUnique.calledOnceWithExactly({
        where: { id: 'nonexistent-id' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }));
      assert(res.status.calledOnceWithExactly(404));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'User not found'
      }));
    });
  });
  
  // Error handling tests
  describe('error handling', () => {
    it('should handle bcrypt errors during registration', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      req.body = userData;
      
      mockPrisma.user.findUnique.resolves(null); // No existing user
      mockBcrypt.genSalt.rejects(new Error('bcrypt error'));
      
      // Act
      await authController.register(req, res, next);
      
      // Assert
      assert(res.status.calledOnceWithExactly(500));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Internal server error'
      }));
    });
    
     it('should handle jwt errors during login', async () => {
       // Arrange
       const userData = {
         email: 'test@example.com',
         password: 'password123'
       };
       req.body = userData;
       
       mockPrisma.user.findUnique.resolves({
         id: 'user-id',
         email: userData.email,
         passwordHash: 'hashedPassword',
         name: 'Test User',
         role: 'USER'
       });
       mockBcrypt.compare.resolves(true); // Password matches
       mockJwt.sign.throws(new Error('jwt error'));
       
       // Act
       await authController.login(req, res, next);
       
       // Assert
       assert(res.status.calledOnceWithExactly(500));
       assert(res.json.calledOnceWithMatch({
         success: false,
         message: 'Internal server error'
       }));
     });
    
    it('should handle prisma errors during getProfile', async () => {
      // Arrange
      req.user = { userId: 'user-id', email: 'test@example.com' };
      
      mockPrisma.user.findUnique.rejects(new Error('prisma error'));
      
      // Act
      await authController.getProfile(req, res, next);
      
      // Assert
      assert(res.status.calledOnceWithExactly(500));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Internal server error'
      }));
    });
  });
});
