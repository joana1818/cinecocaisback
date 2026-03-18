const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Rota pública
router.post('/', contactController.enviarMensagem);

// Rotas administrativas (apenas admin)
router.get('/', authMiddleware, adminMiddleware, contactController.listarMensagens);
router.get('/:id', authMiddleware, adminMiddleware, contactController.buscarMensagem);
router.patch('/:id/lida', authMiddleware, adminMiddleware, contactController.marcarComoLida);
router.delete('/:id', authMiddleware, adminMiddleware, contactController.deletarMensagem);

module.exports = router;