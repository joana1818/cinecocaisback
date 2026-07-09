const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const { parseImageUpload } = require('../utils/imageUpload');

// Rotas públicas
router.get('/', galleryController.listarGaleria);
router.get('/:id', galleryController.buscarItem);

// Rotas administrativas (apenas admin)
router.post('/', authMiddleware, adminMiddleware, parseImageUpload, galleryController.criarItem);
router.put('/:id', authMiddleware, adminMiddleware, parseImageUpload, galleryController.atualizarItem);
router.delete('/:id', authMiddleware, adminMiddleware, galleryController.deletarItem);

module.exports = router;