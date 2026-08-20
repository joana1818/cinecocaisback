const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

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

const getBaseUrl = (req) => {
  const configuredBaseUrl = process.env.PUBLIC_URL || process.env.API_URL || process.env.BACKEND_URL || process.env.APP_URL;

  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.trim()) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  const forwardedProto = req?.headers?.['x-forwarded-proto'] || req?.protocol || 'http';
  const host = req?.get?.('host') || req?.headers?.host;

  if (host) {
    return `${forwardedProto}://${host}`;
  }

  return null;
};

const toPublicUrl = (req, value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedValue = value.replace(/^\.\//, '').replace(/^\/+/, '/');
  const relativePath = normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`;

  const baseUrl = getBaseUrl(req);
  return baseUrl ? `${baseUrl}${relativePath}` : relativePath;
};

const optimizeUploadedImage = async (file) => {
  if (!file || !file.path) {
    return file;
  }

  const originalPath = file.path;
  const optimizedPath = originalPath.replace(/\.[^.]+$/, '') + '-optimized.jpg';

  await sharp(originalPath)
    .resize({
      width: 1400,
      height: 1400,
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(optimizedPath);

  fs.unlinkSync(originalPath);

  return {
    ...file,
    path: optimizedPath,
    filename: path.basename(optimizedPath)
  };
};

const parseImageUpload = (req, res, next) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        error: 'Erro ao enviar imagem',
        details: err.message
      });
    }

    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
      req.file = await optimizeUploadedImage(req.file);
      req.files = [req.file];
    }

    const resolvedUrl = resolveImageUrl(req);

    if (resolvedUrl) {
      req.body = {
        ...(req.body || {})
      };

      const hasExplicitImageField = Boolean(
        req.body?.imagemUrl || req.body?.imageUrl || req.body?.logoUrl
      );

      if (!hasExplicitImageField) {
        req.body.imagemUrl = resolvedUrl;
      }

      if (req.body?.logoUrl && !req.body?.imagemUrl && !req.body?.imageUrl) {
        req.body.imagemUrl = req.body.logoUrl;
      }
    }

    next();
  });
};

const resolveImageUrl = (req) => {
  if (req.file?.filename) {
    return toPublicUrl(req, `/uploads/${req.file.filename}`);
  }

  const value = req.body?.imagemUrl || req.body?.imageUrl || req.body?.logoUrl || req.body?.url || req.body?.imagem || req.body?.image;

  return toPublicUrl(req, value);
};

module.exports = {
  upload,
  parseImageUpload,
  resolveImageUrl,
  buildPublicImageUrl: toPublicUrl
};
