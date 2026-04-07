const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Website Controller', () => {
  let websiteController;
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
      if (key.includes('websiteController') || key.includes('config/prisma')) {
        delete require.cache[key];
      }
    });

    mockPrisma = {
      website: {
        findMany: sinon.stub(),
        findFirst: sinon.stub(),
        findUnique: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
      },
      page: {
        findFirst: sinon.stub(),
        create: sinon.stub(),
      },
      template: {
        findMany: sinon.stub(),
      },
    };

    websiteController = proxyquire('../../src/controllers/website/websiteController', {
      '../../config/prisma': mockPrisma,
    }, { noCallThru: true });

    req = createMockReq();
    res = createMockRes();
  });

  describe('list', () => {
    it('should return list of websites for user', async () => {
      req = createMockReq({}, {}, {}, { userId: 'user-123' });
      const mockWebsites = [
        { id: 'web-1', name: 'My Website', slug: 'my-website', pages: [], _count: { pages: 3 } },
      ];
      mockPrisma.website.findMany.resolves(mockWebsites);

      await websiteController.list(req, res);

      assert(mockPrisma.website.findMany.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
      assert.strictEqual(response.data.length, 1);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.website.findMany.rejects(new Error('DB error'));

      await websiteController.list(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('create', () => {
    it('should create website successfully', async () => {
      req = createMockReq({ name: 'New Website', slug: 'new-website' }, {}, {}, { userId: 'user-123' });
      mockPrisma.website.findUnique.resolves(null);
      mockPrisma.website.create.resolves({
        id: 'web-1',
        name: 'New Website',
        slug: 'new-website',
        userId: 'user-123',
      });

      await websiteController.create(req, res);

      assert(mockPrisma.website.create.calledOnce);
      assert(res.status.calledOnceWithExactly(201));
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 400 if name or slug missing', async () => {
      req = createMockReq({ name: 'New Website' }, {}, {}, { userId: 'user-123' });

      await websiteController.create(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should return 409 if slug already exists', async () => {
      req = createMockReq({ name: 'New Website', slug: 'existing-slug' }, {}, {}, { userId: 'user-123' });
      mockPrisma.website.findUnique.resolves({ id: 'existing-web' });

      await websiteController.create(req, res);

      assert(res.status.calledOnceWithExactly(409));
      assert(mockPrisma.website.create.notCalled);
    });

    it('should return 500 on database error', async () => {
      req = createMockReq({ name: 'New Site', slug: 'new-site' }, {}, {}, { userId: 'user-123' });
      mockPrisma.website.findUnique.rejects(new Error('DB error'));

      await websiteController.create(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('getById', () => {
    it('should return website by id', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      const mockWebsite = { id: 'web-1', name: 'My Website', pages: [] };
      mockPrisma.website.findFirst.resolves(mockWebsite);

      await websiteController.getById(req, res);

      assert(mockPrisma.website.findFirst.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 404 if website not found', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves(null);

      await websiteController.getById(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.website.findFirst.rejects(new Error('DB error'));

      await websiteController.getById(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('update', () => {
    it('should update website successfully', async () => {
      req = createMockReq({ name: 'Updated Name' }, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves({ id: 'web-1' });
      mockPrisma.website.update.resolves({ id: 'web-1', name: 'Updated Name' });

      await websiteController.update(req, res);

      assert(mockPrisma.website.update.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 404 if website not found', async () => {
      req = createMockReq({ name: 'Updated' }, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves(null);

      await websiteController.update(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.website.findFirst.rejects(new Error('DB error'));

      await websiteController.update(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('delete', () => {
    it('should delete website successfully', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves({ id: 'web-1' });
      mockPrisma.website.delete.resolves({ id: 'web-1' });

      await websiteController.delete(req, res);

      assert(mockPrisma.website.delete.calledOnce);
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'Website deleted',
      }));
    });

    it('should return 404 if website not found', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves(null);

      await websiteController.delete(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.website.findFirst.rejects(new Error('DB error'));

      await websiteController.delete(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('getPages', () => {
    it('should return pages for website', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves({
        id: 'web-1',
        pages: [
          { id: 'page-1', name: 'Home', slug: 'home' },
          { id: 'page-2', name: 'About', slug: 'about' },
        ],
      });

      await websiteController.getPages(req, res);

      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
      assert.strictEqual(response.data.length, 2);
    });

    it('should return 404 if website not found', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves(null);

      await websiteController.getPages(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.website.findFirst.rejects(new Error('DB error'));

      await websiteController.getPages(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('createPage', () => {
    it('should create a page for the website', async () => {
      req = createMockReq({ name: 'New Page', slug: 'new-page' }, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves({ id: 'web-1' });
      mockPrisma.page.findFirst.resolves(null);
      mockPrisma.page.create.resolves({ id: 'page-1', name: 'New Page', slug: 'new-page' });

      await websiteController.createPage(req, res);

      assert(mockPrisma.page.create.calledOnce);
      assert(res.status.calledOnceWithExactly(201));
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 400 if name or slug missing', async () => {
      req = createMockReq({ name: 'New Page' }, { id: 'web-1' }, {}, { userId: 'user-123' });

      await websiteController.createPage(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should return 404 if website not found', async () => {
      req = createMockReq({ name: 'New Page', slug: 'new-page' }, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves(null);

      await websiteController.createPage(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 409 if page slug exists', async () => {
      req = createMockReq({ name: 'New Page', slug: 'existing-page' }, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves({ id: 'web-1' });
      mockPrisma.page.findFirst.resolves({ id: 'page-1' });

      await websiteController.createPage(req, res);

      assert(res.status.calledOnceWithExactly(409));
    });

    it('should return 500 on database error', async () => {
      req = createMockReq({ name: 'Page', slug: 'page' }, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.rejects(new Error('DB error'));

      await websiteController.createPage(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('getTemplates', () => {
    it('should return all templates', async () => {
      const mockTemplates = [
        { id: 'tpl-1', name: 'Template 1' },
        { id: 'tpl-2', name: 'Template 2' },
      ];
      mockPrisma.template.findMany.resolves(mockTemplates);

      await websiteController.getTemplates(req, res);

      assert(mockPrisma.template.findMany.calledOnce);
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
      assert.strictEqual(response.data.length, 2);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.template.findMany.rejects(new Error('DB error'));

      await websiteController.getTemplates(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('publish', () => {
    it('should publish website', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves({ id: 'web-1' });
      mockPrisma.website.update.resolves({ id: 'web-1', status: 'PUBLISHED' });

      await websiteController.publish(req, res);

      assert(mockPrisma.website.update.calledOnceWith({
        where: { id: 'web-1' },
        data: { status: 'PUBLISHED' },
      }));
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 404 if website not found', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves(null);

      await websiteController.publish(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.website.findFirst.rejects(new Error('DB error'));

      await websiteController.publish(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });

  describe('archive', () => {
    it('should archive website', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves({ id: 'web-1' });
      mockPrisma.website.update.resolves({ id: 'web-1', status: 'ARCHIVED' });

      await websiteController.archive(req, res);

      assert(mockPrisma.website.update.calledOnceWith({
        where: { id: 'web-1' },
        data: { status: 'ARCHIVED' },
      }));
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
    });

    it('should return 404 if website not found', async () => {
      req = createMockReq({}, { id: 'web-1' }, {}, { userId: 'user-123' });
      mockPrisma.website.findFirst.resolves(null);

      await websiteController.archive(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });

    it('should return 500 on database error', async () => {
      mockPrisma.website.findFirst.rejects(new Error('DB error'));

      await websiteController.archive(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });
});
