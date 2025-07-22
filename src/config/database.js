const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  errorFormat: 'pretty',
});

const connectDB = async () => {
  try {
    // Test de la connexion
    await prisma.$connect();
    console.log('🗄️  PostgreSQL Connected via Prisma');
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error.message);
    process.exit(1);
  }
};

// Fonction pour fermer proprement la connexion
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('🗄️  PostgreSQL Disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from PostgreSQL:', error.message);
  }
};

// Gestion gracieuse de l'arrêt
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB, prisma };