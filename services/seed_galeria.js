const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Converte link do Drive para link direto de imagem
function driveLink(id) {
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

// Extrai ID de links no formato /file/d/ID/view ou open?id=ID
function extractId(url) {
  const match1 = url.match(/\/d\/([\w-]+)/);
  if (match1) return match1[1];
  const match2 = url.match(/id=([\w-]+)/);
  if (match2) return match2[1];
  return null;
}

const fotos = [
  // ---- SEM ANO DEFINIDO (fotos gerais do projeto) ----
  { url: 'https://drive.google.com/file/d/1jYF3Wn3R-8mDlP7HU21Gey85Zv32WMf4/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/15koHqgctUb4HIyvXXvrIvVZ8rndKRa6c/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1W2XH0B8TWETdgrUDAk5EfmRk0kP4zfN-/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1J4iw3uRIcgZvA2plRfABsaP9Aviz-zhQ/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1ZBWvZFS_QwfmuIPmJfb9XMh4QEoLsWOg/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1wEzuIT6S5x4Rv5XHFfrzSDhfL-zV5m4R/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1IDsimDTfFMB7bgK_po2fSBoUruUTaQTg/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1dYwrc2FXupqSPx8ka7U5ndwwLxcu121C/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1f93-tS07JUyJbM5BNDbWRD2VswsNOQKx/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/19FrtwyhkffrmEkVtKR3OOp3CNwySHGV6/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1xm6kIrPBeeDKno9ASC5Wlkb2r_4ohTpd/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/12Bwuho4FwNJz9EoWv-hVKAXkhpocYg4j/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1t4dp5J49UYxflhwBckhMroAJNcb_-aSD/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/13ZafpE7nFExKkJUxf9FS7GWpN-VuRGSy/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1PXgSh0_q1_iWB73oXdK-G9ARUKJmIG23/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1QacmadBgHzDiT83qIgrtoZgJrVQ3bFJV/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1ADEQUSs2y3p0WuzCCwF1jBJR58wk1Fxh/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1awUavuAXvFcEFGTnpVTxYjmN1bDV2J4J/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1WznlBd49mnYkxrj0r7fmYTusYo217Z8t/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1MWo9PJbySuMmoPe9VJ7qLe4LgfrgTrLO/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1O5B-GTImtgcf_uey4q_eOl849vqOtwqt/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1XWJ3jmMntkc6-I-R-FGWnMSLU9HvFb2I/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1bLjloklm_wW8yhxjneIuDCDjtJxdDx-8/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1EpMLAC-khoylwv8WlfbILwRbX447sOBa/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1FP7xPj8MzzvX3qjbgzgPzuan87DeW8M4/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1ZnxOD3b5VVA5hzDI9-jcDy0WQEG3lVz9/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1xgVC8eVYR2qClWqOL_Qv7zcqHc-FhqHK/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1yCZnyAQR-W53GX93KDldZx-xItMyz_5e/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1k5W7xCiiFUj8HTRsX3-xllVy59ljAYj7/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1szkKCCFGBhQ8C0cqlJW-uWMdLnhKryUX/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1IwDd8qa7MoMj4tZU3M_mUFCLA2qZhpJv/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1nqFRWQPnh3PdKSMVwmLWQPXkwl5vncc-/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1hO_mY1yJ7LrwOL-Ub_OzECrb5vWndixV/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1P8-BkjNQIUOTdhDCy5CznaD7kIFWPvC6/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/109mhaHDdEMqZff5pdWVei_2KkZI_tMBG/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1SNo5zimaANECNgcSw0ARsPwAEQbeC_4T/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1knfP5_cqNbqY6PApZahK6CzG9qdVQsKr/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1EhmcpD9bqHYObongMS6fhfYq7rFcm1kE/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1zysSqQyHCTc2pW4-PkSyO-sDFYnunFHM/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/1ilS95cEoiTekt1T3dMYvw-b85JnRWepP/view', titulo: 'Cine Cocais', categoria: 'Geral' },
  { url: 'https://drive.google.com/file/d/14WautTymZs5QQwZWmoyre3T5k-3S3Rnh/view', titulo: 'Cine Cocais', categoria: 'Geral' },

  // ---- 2022 ----
  { url: 'https://drive.google.com/open?id=1rWF0tRwErC-L5lhGkLa8gJBx4pVErqWY', titulo: 'Cine Cocais 2022', categoria: '2022' },
  { url: 'https://drive.google.com/open?id=1ZRL8-s6r9UtIEGrWlk36Z04a60qG9tNz', titulo: 'Cine Cocais 2022', categoria: '2022' },
  { url: 'https://drive.google.com/open?id=1QtFHxQVDjxSza1vGtvd1Cwop6hkaiKer', titulo: 'Cine Cocais 2022', categoria: '2022' },
  { url: 'https://drive.google.com/open?id=171fOz9feaOZwRPxq7a-GtVXF_weSFZgM', titulo: 'Cine Cocais 2022', categoria: '2022' },
  { url: 'https://drive.google.com/open?id=1-Dhe-W5caTnNUb8vpg5sJginEXuhv_Wh', titulo: 'Cine Cocais 2022', categoria: '2022' },

  // ---- 2019 ----
  { url: 'https://drive.google.com/open?id=1HHTH1N_7csGgbj4FSfu6MAJd1N7ePw_V', titulo: 'Cine Cocais 2019', categoria: '2019' },
  { url: 'https://drive.google.com/open?id=1C4HRh5y-ZLZJjN2lXdYsFSEvUHAG_FKO', titulo: 'Cine Cocais 2019', categoria: '2019' },
  { url: 'https://drive.google.com/open?id=1ACN84t3P5PrIzWoU_-Ds1iLLxjK_4xk4', titulo: 'Cine Cocais 2019', categoria: '2019' },
  { url: 'https://drive.google.com/open?id=11JVXrLxLZpJ26nUS4R41TsONo8hNZjXS', titulo: 'Cine Cocais 2019', categoria: '2019' },

  // ---- 2018 ----
  { url: 'https://drive.google.com/open?id=1b5veQOET2bZfdBKsW72ksaQ9Y9K6seDa', titulo: 'Cine Cocais 2018', categoria: '2018' },
  { url: 'https://drive.google.com/open?id=1VWpf-RIbPiXvQvuyCUbN4-dNxQBjADZ7', titulo: 'Cine Cocais 2018', categoria: '2018' },
];

async function main() {
  console.log(`Inserindo ${fotos.length} fotos no banco...`);
  let count = 0;

  for (const foto of fotos) {
    const id = extractId(foto.url);
    if (!id) {
      console.warn(`ID não encontrado para: ${foto.url}`);
      continue;
    }

    const imagemUrl = driveLink(id);

    await prisma.galeriaItem.create({
      data: {
        titulo: foto.titulo,
        descricao: foto.categoria !== 'Geral' ? `Registro do ano ${foto.categoria}` : 'Registro do Projeto Cine Cocais',
        imagemUrl,
        destaque: false,
        ativo: true,
      }
    });

    count++;
    console.log(`✅ ${count}/${fotos.length} - ${foto.titulo} (${foto.categoria})`);
  }

  console.log(`\n🎉 ${count} fotos inseridas com sucesso!`);
}

main()
  .catch(e => console.error('Erro:', e))
  .finally(() => prisma.$disconnect());