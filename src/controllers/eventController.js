const { normalizeBoolean, normalizeOptionalInt } = require('../utils/payloadParsers');
const { buildPublicImageUrl } = require('../utils/imageUpload');
const prisma = require('../config/databse');

// Listar todos os eventos
const listarEventos = async (req, res) => {
  try {
    const { tipo, ativo } = req.query;

    const filtros = {};
    if (tipo) filtros.tipo = tipo;
    if (ativo !== undefined) filtros.ativo = ativo === 'true';

    const eventos = await prisma.evento.findMany({
      where: filtros,
      orderBy: { dataEvento: 'asc' },
      include: {
        _count: {
          select: { inscricoes: true }
        }
      }
    });

    if (eventos.length === 0) {
      res.set('X-Empty-Message', 'Nenhum evento cadastrado no momento');
    }

    const eventosPublicos = eventos.map((evento) => ({
      ...evento,
      imagemUrl: buildPublicImageUrl(req, evento.imagemUrl)
    }));

    res.json(eventosPublicos);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
};

// Buscar evento por ID
const buscarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        inscricoes: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({
      ...evento,
      imagemUrl: buildPublicImageUrl(req, evento.imagemUrl)
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
};

// Criar novo evento (apenas admin)
const criarEvento = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      dataEvento,
      horario,
      local,
      tipo,
      imagemUrl,
      logoUrl,
      vagasTotal
    } = req.body;

    const resolvedImageUrl = imagemUrl || logoUrl;
    const normalizedVagasTotal = normalizeOptionalInt(vagasTotal);

    // Validações
    if (!titulo || !descricao || !dataEvento || !horario || !local || !tipo) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: titulo, descricao, dataEvento, horario, local, tipo' 
      });
    }

    const evento = await prisma.evento.create({
      data: {
        titulo,
        descricao,
        dataEvento: new Date(dataEvento),
        horario,
        local,
        tipo,
        imagemUrl: resolvedImageUrl,
        vagasTotal: normalizedVagasTotal
      }
    });

    res.status(201).json({
      message: 'Evento criado com sucesso',
      evento
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
};

// Atualizar evento (apenas admin)
const atualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = {
      ...req.body,
      vagasTotal: normalizeOptionalInt(req.body?.vagasTotal),
      ativo: normalizeBoolean(req.body?.ativo)
    };

    // Converter dataEvento se vier no body
    if (dados.dataEvento) {
      dados.dataEvento = new Date(dados.dataEvento);
    }

    const evento = await prisma.evento.update({
      where: { id },
      data: dados
    });

    res.json({
      message: 'Evento atualizado com sucesso',
      evento
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
};

// Deletar evento (apenas admin)
const deletarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.evento.delete({
      where: { id }
    });

    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
};

// Inscrever-se em um evento
const inscreverEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Vem do middleware de autenticação

    // Verificar se o evento existe
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inscricoes: true }
        }
      }
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (!evento.ativo) {
      return res.status(400).json({ error: 'Evento não está ativo' });
    }

    // Verificar vagas
    if (evento.vagasTotal && evento._count.inscricoes >= evento.vagasTotal) {
      return res.status(400).json({ error: 'Evento sem vagas disponíveis' });
    }

    // Verificar se já está inscrito
    const inscricaoExistente = await prisma.inscricao.findUnique({
      where: {
        userId_eventoId: {
          userId,
          eventoId: id
        }
      }
    });

    if (inscricaoExistente) {
      return res.status(400).json({ error: 'Você já está inscrito neste evento' });
    }

    // Criar inscrição
    const inscricao = await prisma.inscricao.create({
      data: {
        userId,
        eventoId: id
      },
      include: {
        evento: true
      }
    });

    res.status(201).json({
      message: 'Inscrição realizada com sucesso',
      inscricao
    });
  } catch (error) {
    console.error('Erro ao inscrever em evento:', error);
    res.status(500).json({ error: 'Erro ao realizar inscrição' });
  }
};

// Cancelar inscrição
const cancelarInscricao = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const inscricao = await prisma.inscricao.delete({
      where: {
        userId_eventoId: {
          userId,
          eventoId: id
        }
      }
    });

    res.json({ message: 'Inscrição cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }
    
    res.status(500).json({ error: 'Erro ao cancelar inscrição' });
  }
};

// Listar minhas inscrições
const minhasInscricoes = async (req, res) => {
  try {
    const userId = req.userId;

    const inscricoes = await prisma.inscricao.findMany({
      where: { userId },
      include: {
        evento: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(inscricoes);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    res.status(500).json({ error: 'Erro ao buscar inscrições' });
  }
};

module.exports = {
  listarEventos,
  buscarEvento,
  criarEvento,
  atualizarEvento,
  deletarEvento,
  inscreverEvento,
  cancelarInscricao,
  minhasInscricoes
};