const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveImageUrl } = require('../src/utils/imageUpload');

test('uses uploaded file URL when present', () => {
  const result = resolveImageUrl({
    body: { imagemUrl: 'https://teste.com/foto.jpg' },
    file: { filename: 'foto.png' }
  });

  assert.equal(result, '/uploads/foto.png');
});

test('uses body URL when no file uploaded', () => {
  const result = resolveImageUrl({
    body: { imagemUrl: 'https://teste.com/foto.jpg' },
    file: undefined
  });

  assert.equal(result, 'https://teste.com/foto.jpg');
});

test('converts relative uploaded URLs to absolute URLs using request host', () => {
  const result = resolveImageUrl({
    body: {},
    file: { filename: 'foto.png' },
    protocol: 'https',
    get: (name) => (name === 'host' ? 'api.exemplo.com' : undefined)
  });

  assert.equal(result, 'https://api.exemplo.com/uploads/foto.png');
});

test('normalizes relative upload paths without leading slash', () => {
  const { buildPublicImageUrl } = require('../src/utils/imageUpload');
  const result = buildPublicImageUrl({
    protocol: 'https',
    get: (name) => (name === 'host' ? 'api.exemplo.com' : undefined)
  }, 'uploads/foto.png');

  assert.equal(result, 'https://api.exemplo.com/uploads/foto.png');
});

test('does not duplicate uploaded URLs into logoUrl for gallery uploads', async () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const sharp = require('sharp');
  const imageUpload = require('../src/utils/imageUpload');
  const originalAny = imageUpload.upload.any;
  const filePath = path.join(process.cwd(), 'uploads', 'foto.png');

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 }
    }
  }).png().toFile(filePath);

  imageUpload.upload.any = () => (req, res, callback) => {
    req.body = {};
    req.files = [{
      filename: 'foto.png',
      path: filePath,
      originalname: 'foto.png',
      mimetype: 'image/png'
    }];
    callback(null);
  };

  try {
    const req = {
      body: {},
      protocol: 'https',
      get: (name) => (name === 'host' ? 'api.exemplo.com' : undefined)
    };

    const res = {
      status(code) {
        return { json: () => ({ code }) };
      }
    };

    await new Promise((resolve) => {
      imageUpload.parseImageUpload(req, res, () => resolve());
    });

    assert.equal(req.body.imagemUrl, 'https://api.exemplo.com/uploads/foto-optimized.jpg');
    assert.equal(req.body.logoUrl, undefined);
  } finally {
    imageUpload.upload.any = originalAny;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});
