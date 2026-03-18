const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Testar conexão
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados MySQL');
  } catch (error) {
    console.error('❌ Erro ao conectar no banco de dados:', error);
    process.exit(1);
  }
}

testConnection();

module.exports = prisma;