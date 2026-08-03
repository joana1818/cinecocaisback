const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const { parseImageUpload } = require('../utils/imageUpload');

// Rotas públicas
router.get('/', eventController.listarEventos);

// Rotas autenticadas (usuário logado)
router.post('/:id/inscrever', authMiddleware, eventController.inscreverEvento);
router.delete('/:id/cancelar', authMiddleware, eventController.cancelarInscricao);
router.get('/minhas/inscricoes', authMiddleware, eventController.minhasInscricoes);

router.get('/:id', eventController.buscarEvento);

// Rotas administrativas (apenas admin)
router.post('/', authMiddleware, adminMiddleware, parseImageUpload, eventController.criarEvento);
router.put('/:id', authMiddleware, adminMiddleware, parseImageUpload, eventController.atualizarEvento);
router.delete('/:id', authMiddleware, adminMiddleware, eventController.deletarEvento);

module.exports = router;