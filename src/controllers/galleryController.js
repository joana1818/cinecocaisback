const { normalizeBoolean } = require('../utils/payloadParsers');
const { buildPublicImageUrl } = require('../utils/imageUpload');
const prisma = require('../config/databse');

// Listar itens da galeria
const listarGaleria = async (req, res) => {
  try {
    const { destaque, ativo } = req.query;

    const filtros = {};
    if (destaque !== undefined) filtros.destaque = destaque === 'true';
    if (ativo !== undefined) filtros.ativo = ativo === 'true';

    const galeria = await prisma.galeriaItem.findMany({
      where: filtros,
      orderBy: { createdAt: 'asc' }
    });

    if (galeria.length === 0) {
      res.set('X-Empty-Message', 'Nenhuma foto cadastrada na galeria no momento');
    }

    const galeriaPublica = galeria.map((item) => ({
      ...item,
      imagemUrl: buildPublicImageUrl(req, item.imagemUrl)
    }));

    res.json(galeriaPublica);
  } catch (error) {
    console.error('Erro ao listar galeria:', error);
    res.status(500).json({ error: 'Erro ao buscar galeria' });
  }
};

// Buscar item por ID
const buscarItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.galeriaItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({
      ...item,
      imagemUrl: buildPublicImageUrl(req, item.imagemUrl)
    });
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
};

// Criar item (apenas admin)
const criarItem = async (req, res) => {
  try {
    const { titulo, descricao, imagemUrl, logoUrl, eventoId, destaque } = req.body;
    const resolvedImageUrl = imagemUrl || logoUrl;
    const normalizedDestaque = normalizeBoolean(destaque);

    if (!titulo || !resolvedImageUrl) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: titulo, imagemUrl' 
      });
    }

    const item = await prisma.galeriaItem.create({
      data: {
        titulo,
        descricao,
        imagemUrl: resolvedImageUrl,
        eventoId,
        destaque: normalizedDestaque === undefined ? false : normalizedDestaque
      }
    });

    res.status(201).json({
      message: 'Item adicionado à galeria',
      item
    });
  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ error: 'Erro ao criar item' });
  }
};

// Atualizar item (apenas admin)
const atualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = {
      ...req.body,
      destaque: normalizeBoolean(req.body?.destaque),
      ativo: normalizeBoolean(req.body?.ativo)
    };

    const item = await prisma.galeriaItem.update({
      where: { id },
      data: dados
    });

    res.json({
      message: 'Item atualizado',
      item
    });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
};

// Deletar item (apenas admin)
const deletarItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.galeriaItem.delete({
      where: { id }
    });

    res.json({ message: 'Item deletado' });
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    res.status(500).json({ error: 'Erro ao deletar item' });
  }
};

module.exports = {
  listarGaleria,
  buscarItem,
  criarItem,
  atualizarItem,
  deletarItem
};