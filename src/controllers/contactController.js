const prisma = require('../config/databse');

// Enviar mensagem de contato
const enviarMensagem = async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;

    // Validações
    if (!nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios' 
      });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const contato = await prisma.contato.create({
      data: {
        nome,
        email,
        assunto,
        mensagem
      }
    });

    res.status(201).json({
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      contato: {
        id: contato.id,
        nome: contato.nome,
        createdAt: contato.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

// Listar todas as mensagens (apenas admin)
const listarMensagens = async (req, res) => {
  try {
    const { lido } = req.query;

    const filtros = {};
    if (lido !== undefined) filtros.lido = lido === 'true';

    const mensagens = await prisma.contato.findMany({
      where: filtros,
      orderBy: { createdAt: 'desc' }
    });

    res.json(mensagens);
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
};

// Buscar mensagem por ID (apenas admin)
const buscarMensagem = async (req, res) => {
  try {
    const { id } = req.params;

    const mensagem = await prisma.contato.findUnique({
      where: { id }
    });

    if (!mensagem) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }

    res.json(mensagem);
  } catch (error) {
    console.error('Erro ao buscar mensagem:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagem' });
  }
};

// Marcar mensagem como lida (apenas admin)
const marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;

    const mensagem = await prisma.contato.update({
      where: { id },
      data: { lido: true }
    });

    res.json({
      message: 'Mensagem marcada como lida',
      mensagem
    });
  } catch (error) {
    console.error('Erro ao marcar mensagem:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    res.status(500).json({ error: 'Erro ao marcar mensagem' });
  }
};

// Deletar mensagem (apenas admin)
const deletarMensagem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contato.delete({
      where: { id }
    });

    res.json({ message: 'Mensagem deletada' });
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    res.status(500).json({ error: 'Erro ao deletar mensagem' });
  }
};

module.exports = {
  enviarMensagem,
  listarMensagens,
  buscarMensagem,
  marcarComoLida,
  deletarMensagem
};