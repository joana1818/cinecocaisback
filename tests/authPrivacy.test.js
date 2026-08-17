const test = require('node:test');
const assert = require('node:assert/strict');

const { register } = require('../src/controllers/authController');

const makeRes = () => ({
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.payload = payload;
    return this;
  }
});

test('register omits sensitive user data from response', async () => {
  const prisma = require('../src/config/databse');
  const originalFindUnique = prisma.user.findUnique;
  const originalCreate = prisma.user.create;

  prisma.user.findUnique = async () => null;
  prisma.user.create = async () => ({
    id: 'user-1',
    nome: 'Maria',
    email: 'maria@example.com',
    tipo: 'USUARIO',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    senha: 'hashed-secret',
    cpf: '12345678900',
    telefone: '999999999'
  });

  const req = {
    body: {
      nome: 'Maria',
      email: 'maria@example.com',
      senha: 'senha123',
      cpf: '123.456.789-00',
      telefone: '(99) 99999-9999'
    }
  };
  const res = makeRes();

  await register(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.payload.user.email, 'maria@example.com');
  assert.equal(res.payload.user.senha, undefined);
  assert.equal(res.payload.user.cpf, undefined);
  assert.equal(res.payload.user.telefone, undefined);
  assert.ok(res.payload.token);

  prisma.user.findUnique = originalFindUnique;
  prisma.user.create = originalCreate;
});
