const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

let isConnected = false;

async function ensureConnection() {
  try {
    await prisma.$connect();
    if (!isConnected) {
      console.log('✅ Conectado ao banco de dados MySQL');
    }
    isConnected = true;
  } catch (error) {
    isConnected = false;
    console.error('❌ Erro ao conectar no banco de dados:', error);
  }
}

// Tenta conectar no boot e revalida periodicamente caso o MySQL esteja indisponível.
ensureConnection();
setInterval(() => {
  if (!isConnected) {
    ensureConnection();
  }
}, 10000).unref();

module.exports = prisma;
module.exports.ensureConnection = ensureConnection;
module.exports.isDbConnected = () => isConnected;