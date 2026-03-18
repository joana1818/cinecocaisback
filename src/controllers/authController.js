const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Registrar novo usuário
const register = async (req, res) => {
  try {
    const { nome, email, senha, cpf, telefone } = req.body;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const emailExiste = await prisma.user.findUnique({ where: { email } });
    if (emailExiste) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Verificar se CPF já existe
    if (cpf) {
      const cpfExiste = await prisma.user.findUnique({ where: { cpf } });
      if (cpfExiste) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cpf,
        telefone
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        createdAt: true
      }
    });

    // Gerar token
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      user,
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({ error: 'Usuário desativado' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remover senha do retorno
    const { senha: _, ...userSemSenha } = user;

    res.json({
      message: 'Login realizado com sucesso',
      user: userSemSenha,
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        telefone: true,
        cpf: true,
        ativo: true
      }
    });

    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ error: 'Erro ao verificar token' });
  }
};

module.exports = {
  register,
  login,
  verifyToken
};