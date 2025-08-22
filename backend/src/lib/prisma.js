const { PrismaClient } = require('@prisma/client');

// Simple Prisma client setup
let prisma;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  });
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  // Fallback - create a mock client to prevent crashes
  prisma = {
    user: {
      findUnique: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
      create: () => Promise.resolve(null),
      update: () => Promise.resolve(null),
      delete: () => Promise.resolve(null),
    },
    subscription: {
      create: () => Promise.resolve(null),
    },
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
  };
}

module.exports = { default: prisma, prisma };
