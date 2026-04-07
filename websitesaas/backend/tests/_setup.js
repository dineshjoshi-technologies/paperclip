// Test setup - global mocks and test utilities
// Run before all tests to mock external dependencies

const MockDate = {
  now: new Date('2025-06-01T00:00:00.000Z').getTime(),
};

// Mock crypto.randomUUID for deterministic IDs in tests
const mockUUIDs = [
  'test-user-id-0000-000000000000',
  'test-token-id-0000-000000000000',
];
let mockUUIDIndex = 0;

// Prisma mock client
function createMockPrisma() {
  const mockPrisma = {};
  
  // Initialize all model methods
  const models = ['user', 'website', 'template', 'page', 'component', 'subscription', 'payment', 'paymentGateway', 'passwordResetToken', 'refreshToken', 'emailTemplate', 'onboardingStep'];
  
  for (const model of models) {
    mockPrisma[model] = {
      findUnique: jest.fn ? jest.fn() : async () => null,
      findMany: jest.fn ? jest.fn() : async () => [],
      findFirst: jest.fn ? jest.fn() : async () => null,
      create: jest.fn ? jest.fn() : async (data) => ({ id: `test-${model}-id`, ...data.data }),
      update: jest.fn ? jest.fn() : async (data) => ({ ...data.where, ...(data.data || {}) }),
      upsert: jest.fn ? jest.fn() : async (data) => ({ ...data.create, ...(data.update || {}) }),
      delete: jest.fn ? jest.fn() : async () => ({}),
      deleteMany: jest.fn ? jest.fn() : async () => ({ count: 0 }),
      createMany: jest.fn ? jest.fn() : async () => ({ count: 0 }),
      updateMany: jest.fn ? jest.fn() : async () => ({ count: 0 }),
      count: jest.fn ? jest.fn() : async () => 0,
    };
  }
  
  mockPrisma.$transaction = async (fn) => {
    // Create a mock transaction proxy that uses the regular model methods
    // This allows nested transactions in tests
    return fn(mockPrisma);
  };
  
  mockPrisma.$disconnect = async () => {};
  mockPrisma.$connect = async () => {};
  
  return mockPrisma;
}

// Reset all mock functions
function resetPrismaMocks(prisma) {
  for (const model of Object.values(prisma)) {
    if (model && typeof model === 'object') {
      for (const method of Object.values(model)) {
        if (typeof method === 'function' && method.mockClear) {
          method.mockClear();
        }
      }
    }
  }
}

// Test data factories
const testUser = {
  id: 'test-user-001',
  email: 'test@example.com',
  passwordHash: '$2a$12$mockedhashvalue123456789',
  name: 'Test User',
  role: 'USER',
};

const testAdmin = {
  id: 'test-admin-001',
  email: 'admin@example.com',
  passwordHash: '$2a$12$mockedhashvalue123456789',
  name: 'Test Admin',
  role: 'ADMIN',
};

const testWebsite = {
  id: 'test-website-001',
  name: 'Test Website',
  slug: 'test-website',
  userId: testUser.id,
  status: 'DRAFT',
  templateId: null,
  config: {},
};

const testTemplate = {
  id: 'test-template-001',
  name: 'Test Template',
  description: 'A test template',
  category: 'Business',
  isPremium: false,
  config: {},
};

const testPage = {
  id: 'test-page-001',
  websiteId: testWebsite.id,
  name: 'Home',
  slug: 'home',
  isPublished: true,
  content: {},
};

// JWT test helpers
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'

function generateTestToken(user = testUser) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' })
}

function generateAdminToken() {
  return jwt.sign({ userId: testAdmin.id }, JWT_SECRET, { expiresIn: '15m' })
}

// Auth header helper
function authHeader(user = testUser) {
  const token = generateTestToken(user);
  return { Authorization: `Bearer ${token}` };
}

function adminAuthHeader() {
  const token = generateAdminToken();
  return { Authorization: `Bearer ${token}` };
}

module.exports = {
  createMockPrisma,
  resetPrismaMocks,
  testUser,
  testAdmin,
  testWebsite,
  testTemplate,
  testPage,
  generateTestToken,
  generateAdminToken,
  authHeader,
  adminAuthHeader,
};
