import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@ssc-platform.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'manager@ssc-platform.com',
      passwordHash,
      firstName: 'Manager',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Holder',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      passwordHash,
      firstName: 'Bob',
      lastName: 'Trader',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      role: 'USER',
    },
  });

  console.log(`Created ${superAdmin.email} (SUPER_ADMIN)`);
  console.log(`Created ${admin.email} (ADMIN)`);
  console.log(`Created ${user1.email} (USER)`);
  console.log(`Created ${user2.email} (USER)`);

  // Create transactions
  const buyTx1 = await prisma.transaction.create({
    data: {
      userId: user1.id,
      type: 'BUY',
      amountSSC: 1000,
      amountUSDT: 100,
      rate: 0.1,
      txHash: '0xtx001',
      blockNumber: 1001,
      status: 'COMPLETED',
    },
  });

  const buyTx2 = await prisma.transaction.create({
    data: {
      userId: user2.id,
      type: 'BUY',
      amountSSC: 5000,
      amountUSDT: 500,
      rate: 0.1,
      txHash: '0xtx002',
      blockNumber: 1002,
      status: 'COMPLETED',
    },
  });

  console.log(`Created transactions: ${buyTx1.amountSSC} SSC for ${user1.firstName}, ${buyTx2.amountSSC} SSC for ${user2.firstName}`);

  // Create a buyback request
  const buyback = await prisma.buybackRequest.create({
    data: {
      userId: user1.id,
      amountSSC: 200,
      requestedUSDT: 22,
      rate: 0.11,
      status: 'PENDING',
    },
  });

  console.log(`Created buyback request for ${user1.firstName}`);

  // Create a profit distribution
  const distribution = await prisma.profitDistribution.create({
    data: {
      distributionPeriod: '2026-Q1',
      totalAmount: 50,
      perTokenAmount: 0.00833333,
      snapshotDate: new Date('2026-03-31'),
      status: 'PENDING',
      createdBy: admin.id,
      recipients: {
        create: [
          {
            userId: user1.id,
            tokenAmount: 1000,
            distributionAmount: 8.33333,
          },
          {
            userId: user2.id,
            tokenAmount: 5000,
            distributionAmount: 41.66667,
          },
        ],
      },
    },
  });

  console.log(`Created profit distribution ${distribution.distributionPeriod}`);

  // Create audit log entries
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: superAdmin.id,
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: user1.id,
        details: { email: user1.email },
      },
      {
        actorId: admin.id,
        action: 'PROFIT_DISTRIBUTION_CREATED',
        entityType: 'ProfitDistribution',
        entityId: distribution.id,
        details: { period: distribution.distributionPeriod, total: distribution.totalAmount.toString() },
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
