require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapeia o nome do arquivo para um título legível, agrupado por ano.
function tituloPorArquivo(imagemUrl) {
  const nome = imagemUrl.split('/').pop() || '';

  if (/^2018/.test(nome)) return 'Cine Cocais - 2018';
  if (/^2019/.test(nome)) return 'Cine Cocais - 2019';
  if (/^2022/.test(nome)) return 'Cine Cocais - 2022';
  if (/^IMG-2025/.test(nome)) return 'Cine Cocais - 2025';

  return 'Cine Cocais';
}

async function main() {
  const itens = await prisma.galeriaItem.findMany({
    where: { imagemUrl: { contains: '/uploads/galeria/' } }
  });

  let atualizados = 0;

  for (const item of itens) {
    const novoTitulo = tituloPorArquivo(item.imagemUrl);

    if (novoTitulo !== item.titulo) {
      await prisma.galeriaItem.update({
        where: { id: item.id },
        data: { titulo: novoTitulo }
      });
      atualizados += 1;
    }
  }

  console.log(`✅ ${atualizados} títulos atualizados.`);
}

main()
  .catch((error) => {
    console.error('Erro ao renomear títulos da galeria:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
