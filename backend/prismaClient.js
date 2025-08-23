const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.PRISMA_LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 [Prisma] Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Test connection on startup
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ [Prisma] Connected to database successfully');
  } catch (error) {
    console.error('❌ [Prisma] Failed to connect to database:', error);
  }
}

testConnection();

module.exports = prisma;
