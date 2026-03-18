const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Rotas do usuário logado
router.get('/perfil', authMiddleware, userController.meuPerfil);
router.put('/perfil', authMiddleware, userController.atualizarPerfil);
router.put('/senha', authMiddleware, userController.alterarSenha);

// Rotas administrativas (apenas admin)
router.get('/', authMiddleware, adminMiddleware, userController.listarUsuarios);

module.exports = router;