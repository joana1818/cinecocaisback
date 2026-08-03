const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./config/databse');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  process.env.FRONTEND_URL
].filter(Boolean);

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || localOriginPattern.test(origin)) {
      return callback(null, true);
    }

    console.warn(`⚠️ Origem bloqueada pelo CORS: ${origin}`);
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventRoutes);
app.use('/api/galeria', galleryRoutes);
app.use('/api/contato', contactRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🎬 API Cine Cocais - IFMA', status: 'online' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🎬 Servidor rodando em http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Falha ao iniciar servidor:', error);
});