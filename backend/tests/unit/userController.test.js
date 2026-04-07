const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('User Controller', () => {
  let userController;
  let mockPrisma, mockBcrypt;
  let req, res;

  const createMockReq = (body = {}, params = {}, query = {}, user = { userId: 'user-123' }) => ({
    body, params, query, user,
  });

  const createMockRes = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
  });

  beforeEach(() => {
    sinon.reset();

    Object.keys(require.cache).forEach((key) => {
      if (key.includes('userController') || key.includes('config/prisma')) {
        delete require.cache[key];
      }
    });

    mockPrisma = {
      user: {
        findUnique: sinon.stub(),
        update: sinon.stub(),
        findMany: sinon.stub(),
        count: sinon.stub(),
        delete: sinon.stub(),
      },
    };

    mockBcrypt = {
      compare: sinon.stub(),
      genSalt: sinon.stub().resolves('salt'),
      hash: sinon.stub().resolves('hashedPassword'),
    };

    userController = proxyquire('../../src/controllers/user/userController', {
      '../../config/prisma': mockPrisma,
      'bcryptjs': mockBcrypt,
    }, { noCallThru: true });

    req = createMockReq();
    res = createMockRes();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.resolves(mockUser);
      req = createMockReq({}, {}, {}, { userId: 'user-123' });

      await userController.getProfile(req, res);

      assert(mockPrisma.user.findUnique.calledOnce);
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: mockUser,
      }));
    });

    it('should return 404 when user not found', async () => {
      mockPrisma.user.findUnique.resolves(null);
      req = createMockReq({}, {}, {}, { userId: 'user-123' });

      await userController.getProfile(req, res);

      assert(res.status.calledOnceWithExactly(404));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'User not found',
      }));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.user.findUnique.rejects(new Error('DB error'));
      req = createMockReq({}, {}, {}, { userId: 'user-123' });

      await userController.getProfile(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('updateProfile', () => {
    it('should update user profile with name and avatar', async () => {
      const mockUser = { id: 'user-123', passwordHash: 'hash' };
      const mockUpdated = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'New Name',
        avatar: 'https://example.com/avatar.jpg',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.resolves(mockUser);
      mockPrisma.user.update.resolves(mockUpdated);
      req = createMockReq({ name: 'New Name', avatar: 'https://example.com/avatar.jpg' }, {}, {}, { userId: 'user-123' });

      await userController.updateProfile(req, res);

      assert(mockPrisma.user.update.called);
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: mockUpdated,
      }));
    });

    it('should update password when currentPassword provided', async () => {
      const mockUser = { id: 'user-123', passwordHash: 'oldHash' };
      mockPrisma.user.findUnique.resolves(mockUser);
      mockBcrypt.compare.resolves(true);
      mockPrisma.user.update.resolves({ id: 'user-123' });
      req = createMockReq({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      }, {}, {}, { userId: 'user-123' });

      await userController.updateProfile(req, res);

      assert(mockBcrypt.compare.calledOnceWith('oldPassword', 'oldHash'));
      assert(mockBcrypt.genSalt.calledOnce);
      assert(mockBcrypt.hash.calledOnceWith('newPassword123', 'salt'));
    });

    it('should return 400 when newPassword without currentPassword', async () => {
      const mockUser = { id: 'user-123', passwordHash: 'hash' };
      mockPrisma.user.findUnique.resolves(mockUser);
      req = createMockReq({ newPassword: 'newPassword123' }, {}, {}, { userId: 'user-123' });

      await userController.updateProfile(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Current password is required to change password',
      }));
    });

    it('should return 401 when currentPassword is incorrect', async () => {
      const mockUser = { id: 'user-123', passwordHash: 'oldHash' };
      mockPrisma.user.findUnique.resolves(mockUser);
      mockBcrypt.compare.resolves(false);
      req = createMockReq({
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      }, {}, {}, { userId: 'user-123' });

      await userController.updateProfile(req, res);

      assert(res.status.calledOnceWithExactly(401));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Current password is incorrect',
      }));
    });

    it('should return 404 when user not found', async () => {
      mockPrisma.user.findUnique.resolves(null);
      req = createMockReq({}, {}, {}, { userId: 'user-123' });

      await userController.updateProfile(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.user.findUnique.rejects(new Error('DB error'));
      req = createMockReq({}, {}, {}, { userId: 'user-123' });

      await userController.updateProfile(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('list', () => {
    it('should return paginated list of users', async () => {
      req = createMockReq({}, {}, { page: '1', limit: '10' });
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com', name: 'User 1', role: 'USER' },
        { id: 'user-2', email: 'user2@example.com', name: 'User 2', role: 'ADMIN' },
      ];
      mockPrisma.user.findMany.resolves(mockUsers);
      mockPrisma.user.count.resolves(2);

      await userController.list(req, res);

      assert(mockPrisma.user.findMany.calledOnce);
      assert(mockPrisma.user.count.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
      assert.strictEqual(response.data.length, 2);
      assert.strictEqual(response.pagination.total, 2);
    });

    it('should filter users by role', async () => {
      req = createMockReq({}, {}, { role: 'ADMIN' });
      const mockUsers = [
        { id: 'user-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      ];
      mockPrisma.user.findMany.resolves(mockUsers);
      mockPrisma.user.count.resolves(1);

      await userController.list(req, res);

      assert(mockPrisma.user.findMany.calledOnce);
      assert(mockPrisma.user.count.calledOnce);
      const callArgs = mockPrisma.user.findMany.firstCall.args[0];
      assert.deepStrictEqual(callArgs.where, { role: 'ADMIN' });
    });

    it('should return 500 on database error', async () => {
      req = createMockReq();
      mockPrisma.user.findMany.rejects(new Error('DB error'));

      await userController.list(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      req = createMockReq({}, { id: 'user-123' });
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        _count: { websites: 5 },
      };
      mockPrisma.user.findUnique.resolves(mockUser);

      await userController.getById(req, res);

      assert(mockPrisma.user.findUnique.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 404 when user not found', async () => {
      req = createMockReq({}, { id: 'nonexistent' });
      mockPrisma.user.findUnique.resolves(null);

      await userController.getById(req, res);

      assert(res.status.calledOnceWithExactly(404));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'User not found',
      }));
    });

    it('should return 500 on database error', async () => {
      req = createMockReq({}, { id: 'user-123' });
      mockPrisma.user.findUnique.rejects(new Error('DB error'));

      await userController.getById(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('updateRole', () => {
    it('should update user role successfully', async () => {
      req = createMockReq({ role: 'ADMIN' }, { id: 'user-123' });
      const mockUser = { id: 'user-123' };
      const mockUpdated = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.resolves(mockUser);
      mockPrisma.user.update.resolves(mockUpdated);

      await userController.updateRole(req, res);

      assert(mockPrisma.user.update.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 400 when role is missing', async () => {
      req = createMockReq({}, { id: 'user-123' });

      await userController.updateRole(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Role is required',
      }));
    });

    it('should return 400 when role is invalid', async () => {
      req = createMockReq({ role: 'INVALID_ROLE' }, { id: 'user-123' });

      await userController.updateRole(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Invalid role',
      }));
    });

    it('should return 404 when user not found', async () => {
      req = createMockReq({ role: 'ADMIN' }, { id: 'nonexistent' });
      mockPrisma.user.findUnique.resolves(null);

      await userController.updateRole(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      req = createMockReq({ role: 'ADMIN' }, { id: 'user-123' });
      mockPrisma.user.findUnique.rejects(new Error('DB error'));

      await userController.updateRole(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      req = createMockReq({}, { id: 'user-456' }, {}, { userId: 'user-123' });
      const mockUser = { id: 'user-456' };
      mockPrisma.user.findUnique.resolves(mockUser);
      mockPrisma.user.delete.resolves(mockUser);

      await userController.delete(req, res);

      assert(mockPrisma.user.delete.calledOnce);
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'User deleted',
      }));
    });

    it('should return 400 when trying to delete own account', async () => {
      req = createMockReq({}, { id: 'user-123' }, {}, { userId: 'user-123' });

      await userController.delete(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Cannot delete your own account',
      }));
      assert(mockPrisma.user.delete.notCalled);
    });

    it('should return 404 when user not found', async () => {
      req = createMockReq({}, { id: 'nonexistent' }, {}, { userId: 'user-123' });
      mockPrisma.user.findUnique.resolves(null);

      await userController.delete(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      req = createMockReq({}, { id: 'user-456' }, {}, { userId: 'user-123' });
      mockPrisma.user.findUnique.rejects(new Error('DB error'));

      await userController.delete(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });
});
