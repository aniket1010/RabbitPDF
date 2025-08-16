const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSessions() {
  try {
    const sessions = await prisma.session.findMany();
    console.log('Sessions in database:');
    sessions.forEach(session => {
      console.log('Token:', session.token);
      console.log('Length:', session.token.length);
      console.log('User:', session.userId);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessions();
