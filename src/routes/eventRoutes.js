const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Rotas públicas
router.get('/', eventController.listarEventos);
router.get('/:id', eventController.buscarEvento);

// Rotas autenticadas (usuário logado)
router.post('/:id/inscrever', authMiddleware, eventController.inscreverEvento);
router.delete('/:id/cancelar', authMiddleware, eventController.cancelarInscricao);
router.get('/minhas/inscricoes', authMiddleware, eventController.minhasInscricoes);

// Rotas administrativas (apenas admin)
router.post('/', authMiddleware, adminMiddleware, eventController.criarEvento);
router.put('/:id', authMiddleware, adminMiddleware, eventController.atualizarEvento);
router.delete('/:id', authMiddleware, adminMiddleware, eventController.deletarEvento);

module.exports = router;