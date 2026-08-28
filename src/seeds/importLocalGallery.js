require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;

function descricaoPorCategoria(categoria, titulo = '', url = '') {
  const texto = `${titulo} ${url}`.toLowerCase();

  if (categoria === '2018') {
    if (/trofeu/.test(texto)) return 'Registro do troféu Milton Santos';
    if (/snct|semana nacional/.test(texto)) return 'Registro da Semana Nacional de Ciência e Tecnologia do Maranhão 2018 (SNCT)';
    return 'SNCT';
  }

  if (categoria === '2019') return 'Festival Milton Santos';

  if (categoria === '2025') {
    return 'Festival de cinema Cine Cocais - cinema, cultura e representações raciais';
  }

  return `Registro do Projeto Cine Cocais - ${categoria}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const data = { pasta: 'uploads/galeria' };

  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key || !value) continue;
    data[key.replace(/^--/, '')] = value;
  }

  return data;
}

async function main() {
  const { pasta, categoria = 'Geral' } = parseArgs();
  const pastaAbsoluta = path.resolve(process.cwd(), pasta);

  if (!fs.existsSync(pastaAbsoluta)) {
    console.error(`Pasta não encontrada: ${pastaAbsoluta}`);
    console.error('Crie a pasta, coloque as fotos dentro e rode novamente.');
    process.exit(1);
  }

  const arquivos = fs.readdirSync(pastaAbsoluta).filter((nome) => IMAGE_EXTENSIONS.test(nome));

  if (!arquivos.length) {
    console.error(`Nenhuma imagem encontrada em ${pastaAbsoluta}`);
    process.exit(1);
  }

  // Caminho salvo no banco é relativo à pasta uploads/, servida como estática pelo Express.
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  let created = 0;

  for (const arquivo of arquivos) {
    const caminhoRelativoAoUploads = path.relative(uploadsDir, path.join(pastaAbsoluta, arquivo)).replace(/\\/g, '/');
    const imagemUrl = `/uploads/${caminhoRelativoAoUploads}`;
    const titulo = path.basename(arquivo, path.extname(arquivo));

    await prisma.galeriaItem.create({
      data: {
        titulo,
        descricao: descricaoPorCategoria(categoria, titulo, imagemUrl),
        imagemUrl,
        destaque: false,
        ativo: true
      }
    });

    created += 1;
    console.log(`✅ ${created} - ${titulo}`);
  }

  console.log(`\n🎉 ${created} fotos importadas da pasta "${pasta}" para a galeria!`);
}

main()
  .catch((error) => {
    console.error('Erro ao importar galeria local:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
