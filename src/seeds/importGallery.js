require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function driveLink(id) {
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

function extractId(url) {
  const match1 = url.match(/\/d\/([\w-]+)/);
  if (match1) return match1[1];
  const match2 = url.match(/id=([\w-]+)/);
  if (match2) return match2[1];
  return null;
}

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
  const data = { file: 'gallery_links.txt' };

  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key || !value) continue;
    const normalized = key.replace(/^--/, '');
    data[normalized] = value;
  }

  return data;
}

async function main() {
  const { file, categoria = 'Geral' } = parseArgs();
  const filePath = path.resolve(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    console.error('Crie um arquivo com lista de links e rode: node src/seeds/importGallery.js --file=gallery_links.txt');
    process.exit(1);
  }

  const lines = fs.readFileSync(filePath, 'utf-8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  if (!lines.length) {
    console.error('Nenhum link encontrado no arquivo. Cada linha deve conter um link ou formato título||link.');
    process.exit(1);
  }

  let created = 0;

  for (const line of lines) {
    const parts = line.split('||').map(part => part.trim());
    const url = parts.length === 1 ? parts[0] : parts[1];
    const titulo = parts.length === 1 ? `Galeria ${created + 1}` : parts[0];
    const descricao = parts.length === 3 ? parts[2] : descricaoPorCategoria(categoria, titulo, url);

    if (!url) {
      console.warn(`Linha inválida, pulando: ${line}`);
      continue;
    }

    const id = extractId(url);
    const imagemUrl = id ? driveLink(id) : url;

    await prisma.galeriaItem.create({
      data: {
        titulo,
        descricao,
        imagemUrl,
        destaque: false,
        ativo: true
      }
    });

    created += 1;
    console.log(`✅ ${created} - ${titulo}`);
  }

  console.log(`\n🎉 ${created} fotos importadas para a galeria com sucesso!`);
}

main()
  .catch(error => {
    console.error('Erro ao importar galeria:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
