const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeBoolean,
  normalizeOptionalInt
} = require('../src/utils/payloadParsers');

test('normalizeBoolean converts multipart boolean strings', () => {
  assert.equal(normalizeBoolean('true'), true);
  assert.equal(normalizeBoolean('false'), false);
});

test('normalizeOptionalInt converts multipart number strings', () => {
  assert.equal(normalizeOptionalInt('120'), 120);
});

test('normalizeOptionalInt keeps empty values nullable', () => {
  assert.equal(normalizeOptionalInt(''), null);
  assert.equal(normalizeOptionalInt(undefined), null);
});