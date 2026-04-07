
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Seed default payment gateways
  const razorpayGateway = await prisma.paymentGateway.upsert({
    where: { provider: 'razorpay' },
    update: {},
    create: {
      provider: 'razorpay',
      enabled: true,
      testMode: true,
    },
  });

  const stripeGateway = await prisma.paymentGateway.upsert({
    where: { provider: 'stripe' },
    update: {},
    create: {
      provider: 'stripe',
      enabled: true,
      testMode: true,
    },
  });

  console.log(`Payment gateways seeded: razorpay (${razorpayGateway.id}), stripe (${stripeGateway.id})`);

  // Seed templates
  const templates = [
    {
      name: 'Business Starter',
      description: 'A clean, professional template for small businesses',
      category: 'business',
      isPremium: false,
      config: { colors: { primary: '#2563eb', secondary: '#1e293b' }, layout: 'single-page' },
    },
    {
      name: 'Portfolio Showcase',
      description: 'Minimal template for designers and creatives',
      category: 'portfolio',
      isPremium: true,
      config: { colors: { primary: '#7c3aed', secondary: '#0f172a' }, layout: 'grid' },
    },
    {
      name: 'E-Commerce Pro',
      description: 'Full-featured e-commerce template with product pages',
      category: 'ecommerce',
      isPremium: true,
      config: { colors: { primary: '#059669', secondary: '#1e293b' }, layout: 'multi-page' },
    },
    {
      name: 'Blog Modern',
      description: 'Clean blog template with markdown support',
      category: 'blog',
      isPremium: false,
      config: { colors: { primary: '#0ea5e9', secondary: '#334155' }, layout: 'blog' },
    },
    {
      name: 'Landing Page',
      description: 'High-converting single page landing template',
      category: 'business',
      isPremium: false,
      config: { colors: { primary: '#f59e0b', secondary: '#1e293b' }, layout: 'single-page' },
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
    console.log(`Template seeded: ${template.name}`);
  }

  // Seed a test admin user
  const adminPassword = await bcrypt.hash('admin12345', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@djtechnologies.com' },
    update: {},
    create: {
      email: 'admin@djtechnologies.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
      onboardingStep: 5,
      onboardingStartedAt: new Date(),
      onboardingCompletedAt: new Date(),
    },
  });

  console.log(`Admin user seeded: ${adminUser.email} (${adminUser.id})`);

  // Seed a test regular user
  const testPassword = await bcrypt.hash('testuser123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: testPassword,
      name: 'Test User',
      role: 'USER',
      emailVerified: true,
      onboardingStep: 3,
      onboardingStartedAt: new Date(),
    },
  });

  console.log(`Test user seeded: ${testUser.email} (${testUser.id})`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
