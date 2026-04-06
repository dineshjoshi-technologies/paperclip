const { PrismaClient } = require('@prisma/client');

let prismaInstance = null;

function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

const prisma = new Proxy({}, {
  get(_target, prop) {
    const instance = getPrisma();
    return instance[prop];
  },
});

module.exports = prisma;
