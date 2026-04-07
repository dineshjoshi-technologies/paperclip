const { getTestPrisma, truncateAll, seedTestData } = require('./utils/setupTestDb');

async function setup() {
  console.log('Setting up test database...');
  const prisma = getTestPrisma();

  try {
    await prisma.$connect();
    console.log('Connected to test database');

    await truncateAll();
    console.log('Truncated all tables');

    const data = await seedTestData();
    console.log('Seeded test data:', {
      users: data.users.length,
      template: data.template.name,
      website: data.website.slug,
      page: data.page.slug,
    });

    return data;
  } catch (error) {
    console.error('Test setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setup().then((data) => {
    console.log('Test database ready');
    process.exit(0);
  });
}

module.exports = { setup, truncateAll, seedTestData };
