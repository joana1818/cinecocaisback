require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const data = {};

  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key || !value) continue;
    data[key.replace(/^--/, '')] = value;
  }

  return data;
}

async function main() {
  const { email, senha, nome = 'Admin', tipo = 'ADMIN' } = parseArgs();

  if (!email || !senha) {
    console.error('Use: node src/seeds/createAdmin.js --email=EMAIL --senha=SENHA [--nome=NOME]');
    process.exit(1);
  }

  if (tipo !== 'ADMIN' && tipo !== 'USUARIO') {
    console.error('Tipo inválido. Use ADMIN ou USUARIO.');
    process.exit(1);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.error(`Já existe um usuário com o email ${email}.`);
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const user = await prisma.user.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      tipo,
      ativo: true
    }
  });

  console.log('✅ Usuário admin criado com sucesso:');
  console.log(`ID: ${user.id}`);
  console.log(`Nome: ${user.nome}`);
  console.log(`Email: ${user.email}`);
  console.log(`Tipo: ${user.tipo}`);
}

main()
  .catch((error) => {
    console.error('Erro ao criar admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
