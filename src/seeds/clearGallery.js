require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const { count } = await prisma.galeriaItem.deleteMany({});
  console.log(`🗑️  ${count} itens removidos da galeria.`);
}

main()
  .catch((error) => {
    console.error('Erro ao limpar galeria:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
