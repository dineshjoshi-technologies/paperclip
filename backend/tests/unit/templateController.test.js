const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Template Controller', () => {
  let templateController;
  let mockPrisma;
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
      if (key.includes('templateController') || key.includes('config/prisma')) {
        delete require.cache[key];
      }
    });

    mockPrisma = {
      template: {
        findMany: sinon.stub(),
        findUnique: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
      },
    };

    templateController = proxyquire('../../src/controllers/template/templateController', {
      '../../config/prisma': mockPrisma,
    }, { noCallThru: true });

    req = createMockReq();
    res = createMockRes();
  });

  describe('list', () => {
    it('should return list of templates', async () => {
      const mockTemplates = [
        { id: 'tpl-1', name: 'Template 1', category: 'business' },
        { id: 'tpl-2', name: 'Template 2', category: 'portfolio' },
      ];
      mockPrisma.template.findMany.resolves(mockTemplates);

      await templateController.list(req, res);

      assert(mockPrisma.template.findMany.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
      assert.strictEqual(response.data.length, 2);
    });

    it('should filter templates by category', async () => {
      req = createMockReq({}, {}, { category: 'business' });
      const mockTemplates = [{ id: 'tpl-1', name: 'Template 1', category: 'business' }];
      mockPrisma.template.findMany.resolves(mockTemplates);

      await templateController.list(req, res);

      assert(mockPrisma.template.findMany.calledOnce);
      const callArgs = mockPrisma.template.findMany.firstCall.args[0];
      assert.deepStrictEqual(callArgs.where, { category: 'business' });
    });

    it('should filter templates by isPremium', async () => {
      req = createMockReq({}, {}, { isPremium: 'true' });
      const mockTemplates = [{ id: 'tpl-1', name: 'Premium Template', isPremium: true }];
      mockPrisma.template.findMany.resolves(mockTemplates);

      await templateController.list(req, res);

      const callArgs = mockPrisma.template.findMany.firstCall.args[0];
      assert.strictEqual(callArgs.where.isPremium, true);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.template.findMany.rejects(new Error('DB error'));

      await templateController.list(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('getById', () => {
    it('should return template by id', async () => {
      req = createMockReq({}, { id: 'tpl-1' });
      const mockTemplate = { id: 'tpl-1', name: 'Template 1' };
      mockPrisma.template.findUnique.resolves(mockTemplate);

      await templateController.getById(req, res);

      assert(mockPrisma.template.findUnique.calledOnceWith({ where: { id: 'tpl-1' } }));
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 404 if template not found', async () => {
      req = createMockReq({}, { id: 'nonexistent' });
      mockPrisma.template.findUnique.resolves(null);

      await templateController.getById(req, res);

      assert(res.status.calledOnceWithExactly(404));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Template not found',
      }));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.template.findUnique.rejects(new Error('DB error'));

      await templateController.getById(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('create', () => {
    it('should create template successfully', async () => {
      req = createMockReq({ name: 'New Template', category: 'portfolio' });
      mockPrisma.template.create.resolves({
        id: 'tpl-1',
        name: 'New Template',
        category: 'portfolio',
      });

      await templateController.create(req, res);

      assert(mockPrisma.template.create.calledOnce);
      assert(res.status.calledOnceWithExactly(201));
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 400 if name is missing', async () => {
      req = createMockReq({ description: 'A description' });

      await templateController.create(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Name is required',
      }));
    });

    it('should return 500 on database error', async () => {
      req = createMockReq({ name: 'Test Template', category: 'test' });
      mockPrisma.template.create.rejects(new Error('DB error'));

      await templateController.create(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('update', () => {
    it('should update template successfully', async () => {
      req = createMockReq({ name: 'Updated Name' }, { id: 'tpl-1' });
      mockPrisma.template.findUnique.resolves({ id: 'tpl-1' });
      mockPrisma.template.update.resolves({ id: 'tpl-1', name: 'Updated Name' });

      await templateController.update(req, res);

      assert(mockPrisma.template.update.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 404 if template not found', async () => {
      req = createMockReq({ name: 'Updated' }, { id: 'nonexistent' });
      mockPrisma.template.findUnique.resolves(null);

      await templateController.update(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      req = createMockReq({ name: 'Updated' }, { id: 'tpl-1' });
      mockPrisma.template.findUnique.rejects(new Error('DB error'));

      await templateController.update(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('delete', () => {
    it('should delete template successfully', async () => {
      req = createMockReq({}, { id: 'tpl-1' });
      mockPrisma.template.findUnique.resolves({ id: 'tpl-1' });
      mockPrisma.template.delete.resolves({ id: 'tpl-1' });

      await templateController.delete(req, res);

      assert(mockPrisma.template.delete.calledOnceWith({ where: { id: 'tpl-1' } }));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'Template deleted',
      }));
    });

    it('should return 404 if template not found', async () => {
      req = createMockReq({}, { id: 'nonexistent' });
      mockPrisma.template.findUnique.resolves(null);

      await templateController.delete(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.template.findUnique.rejects(new Error('DB error'));

      await templateController.delete(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });
});