const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Listar todos os usuários (apenas admin)
const listarUsuarios = async (req, res) => {
  try {
    const { tipo, ativo } = req.query;

    const filtros = {};
    if (tipo) filtros.tipo = tipo;
    if (ativo !== undefined) filtros.ativo = ativo === 'true';

    const usuarios = await prisma.user.findMany({
      where: filtros,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        tipo: true,
        ativo: true,
        createdAt: true,
        _count: {
          select: { inscricoes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// Buscar perfil do usuário logado
const meuPerfil = async (req, res) => {
  try {
    const userId = req.userId;

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        tipo: true,
        createdAt: true,
        inscricoes: {
          include: {
            evento: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

// Atualizar perfil do usuário logado
const atualizarPerfil = async (req, res) => {
  try {
    const userId = req.userId;
    const { nome, telefone, cpf } = req.body;

    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (telefone) dadosAtualizacao.telefone = telefone;
    if (cpf) dadosAtualizacao.cpf = cpf;

    const usuario = await prisma.user.update({
      where: { id: userId },
      data: dadosAtualizacao,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        tipo: true
      }
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      usuario
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'CPF já está em uso' });
    }
    
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

// Alterar senha
const alterarSenha = async (req, res) => {
  try {
    const userId = req.userId;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ 
        error: 'Senha atual e nova senha são obrigatórias' 
      });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: userId }
    });

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { senha: novaSenhaHash }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

module.exports = {
  listarUsuarios,
  meuPerfil,
  atualizarPerfil,
  alterarSenha
};