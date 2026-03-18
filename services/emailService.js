const nodemailer = require('nodemailer');

// Configuração do transporter (descomente e configure se quiser usar email)
/*
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
*/

// Enviar email de boas-vindas
const enviarBoasVindas = async (nome, email) => {
  try {
    // Por enquanto apenas loga (descomente o código acima para enviar emails de verdade)
    console.log(`📧 Email de boas-vindas para ${nome} (${email})`);
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    return false;
  }
};

// Enviar confirmação de inscrição em evento
const enviarConfirmacaoInscricao = async (nome, email, nomeEvento, dataEvento) => {
  try {
    console.log(`📧 Confirmação de inscrição em "${nomeEvento}" para ${nome} (${email})`);
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar confirmação de inscrição:', error);
    return false;
  }
};

// Enviar notificação de novo contato (para admin)
const notificarNovoContato = async (nome, email, assunto) => {
  try {
    console.log(`📧 Nova mensagem de contato de ${nome} (${email}) - Assunto: ${assunto}`);
    
    return true;
  } catch (error) {
    console.error('Erro ao notificar novo contato:', error);
    return false;
  }
};

module.exports = {
  enviarBoasVindas,
  enviarConfirmacaoInscricao,
  notificarNovoContato
};