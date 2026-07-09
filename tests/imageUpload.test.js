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
