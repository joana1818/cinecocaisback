const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Rotas públicas
router.get('/', galleryController.listarGaleria);
router.get('/:id', galleryController.buscarItem);

// Rotas administrativas (apenas admin)
router.post('/', authMiddleware, adminMiddleware, galleryController.criarItem);
router.put('/:id', authMiddleware, adminMiddleware, galleryController.atualizarItem);
router.delete('/:id', authMiddleware, adminMiddleware, galleryController.deletarItem);

module.exports = router;