const { PrismaClient } = require('@prisma/client');

let testPrisma = null;

function getTestPrisma() {
  if (!testPrisma) {
    testPrisma = new PrismaClient();
  }
  return testPrisma;
}

async function truncateAll() {
  const prisma = getTestPrisma();
  const tables = [
    'components', 'pages', 'websites', 'templates',
    'invoices', 'payments', 'subscriptions', 'payment_gateways',
    'email_logs', 'user_onboarding_milestones',
    'password_reset_tokens', 'api_keys', 'refresh_tokens',
    'users'
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

async function seedTestData() {
  const prisma = getTestPrisma();
  const bcrypt = require('bcryptjs');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({ data: { email: 'user@test.com', passwordHash: hashedPassword, name: 'Test User', role: 'USER' } }),
    prisma.user.create({ data: { email: 'admin@test.com', passwordHash: hashedPassword, name: 'Admin User', role: 'ADMIN' } }),
    prisma.user.create({ data: { email: 'superadmin@test.com', passwordHash: hashedPassword, name: 'Super Admin', role: 'SUPER_ADMIN' } }),
  ]);

  const template = await prisma.template.create({
    data: { name: 'Business Template', description: 'A business website template', category: 'business', isPremium: false },
  });

  const website = await prisma.website.create({
    data: { name: 'Test Website', slug: 'test-website', userId: users[0].id, templateId: template.id, status: 'DRAFT' },
  });

  const page = await prisma.page.create({
    data: { name: 'Home', slug: 'home', websiteId: website.id, content: { title: 'Welcome' } },
  });

  return { users, template, website, page };
}

async function setupTestEnvironment() {
  await truncateAll();
  return seedTestData();
}

module.exports = { getTestPrisma, truncateAll, seedTestData, setupTestEnvironment };
