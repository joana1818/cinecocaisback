// Validar email
const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar CPF
const validarCPF = (cpf) => {
  if (!cpf) return true;
  
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  return true;
};

// Middleware de validação de cadastro
const validarCadastro = (req, res, next) => {
  const { nome, email, senha } = req.body;
  
  if (!nome || !email || !senha) {
    return res.status(400).json({ 
      error: 'Nome, email e senha são obrigatórios' 
    });
  }
  
  if (!validarEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  if (senha.length < 6) {
    return res.status(400).json({ 
      error: 'Senha deve ter no mínimo 6 caracteres' 
    });
  }
  
  next();
};

module.exports = {
  validarEmail,
  validarCPF,
  validarCadastro
};