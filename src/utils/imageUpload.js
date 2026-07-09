const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const baseName = path.basename(file.originalname || 'imagem', ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}-${baseName}${ext || '.jpg'}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;

  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const parseImageUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'Erro ao enviar imagem',
        details: err.message
      });
    }

    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }

    const resolvedUrl = resolveImageUrl(req);

    if (resolvedUrl) {
      if (!req.body?.imagemUrl && !req.body?.imageUrl && !req.body?.logoUrl) {
        req.body = {
          ...(req.body || {}),
          imagemUrl: resolvedUrl
        };
      }

      if (!req.body?.logoUrl) {
        req.body = {
          ...(req.body || {}),
          logoUrl: resolvedUrl
        };
      }
    }

    next();
  });
};

const resolveImageUrl = (req) => {
  if (req.file?.filename) {
    return `/uploads/${req.file.filename}`;
  }

  const value = req.body?.imagemUrl || req.body?.imageUrl || req.body?.logoUrl || req.body?.url || req.body?.imagem || req.body?.image;

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return null;
};

module.exports = {
  upload,
  parseImageUpload,
  resolveImageUrl
};
